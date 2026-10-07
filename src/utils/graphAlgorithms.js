import { CROP_TYPES, PIPE_CONDITIONS, SOIL_TYPES } from '../constants';

/**
 * Calculates Haversine distance in meters between two coordinates.
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // meters
}

/**
 * Computes 3D distance taking elevation differences into account.
 */
export function calculate3DDistance(nodeA, nodeB) {
  const horizontalDist = calculateHaversineDistance(nodeA.lat, nodeA.lng, nodeB.lat, nodeB.lng);
  const elevDiff = (nodeB.elevation || 0) - (nodeA.elevation || 0);
  return Math.sqrt(horizontalDist * horizontalDist + elevDiff * elevDiff);
}

/**
 * Computes terrain slope % from nodeA to nodeB.
 * Negative = Downhill (Gravity assisted), Positive = Uphill (Pumping head needed)
 */
export function calculateSlopePercent(nodeA, nodeB) {
  const horizontalDist = calculateHaversineDistance(nodeA.lat, nodeA.lng, nodeB.lat, nodeB.lng);
  if (horizontalDist < 1) return 0;
  const elevDiff = (nodeB.elevation || 0) - (nodeA.elevation || 0);
  return (elevDiff / horizontalDist) * 100;
}

/**
 * Hydrological flow velocity calculation (m/s).
 * Gravity downhill increases speed; uphill slows velocity.
 */
export function calculateEffectiveSpeed(baseSpeed, slopePercent, conditionId) {
  const condition = PIPE_CONDITIONS[conditionId] || PIPE_CONDITIONS.normal;
  if (conditionId === 'blocked') return 0;

  let slopeFactor = 1.0;
  if (slopePercent < 0) {
    // Downhill: gravity assistance up to +45% speed
    slopeFactor = 1.0 + Math.min(0.45, Math.abs(slopePercent) * 0.08);
  } else {
    // Uphill: head loss resistance down to 60% speed
    slopeFactor = Math.max(0.60, 1.0 - Math.min(0.40, slopePercent * 0.07));
  }

  const speed = baseSpeed * slopeFactor * condition.speedMultiplier;
  return Math.max(0.1, Number(speed.toFixed(2)));
}

/**
 * Hydrates edge with dynamic attributes: distance, slope, speed, travel time, and cost.
 */
export function hydrateEdge(edge, nodesMap, defaultPricePerMeter = 12, defaultBaseSpeed = 1.5) {
  const u = nodesMap.get(edge.from);
  const v = nodesMap.get(edge.to);

  if (!u || !v) return null;

  const distance = Math.round(calculate3DDistance(u, v));
  const slope = Number(calculateSlopePercent(u, v).toFixed(1));
  const condId = edge.condition || 'normal';
  const cond = PIPE_CONDITIONS[condId] || PIPE_CONDITIONS.normal;

  const unitPrice = edge.pipePricePerMeter !== undefined ? edge.pipePricePerMeter : defaultPricePerMeter;
  const baseSpeed = defaultBaseSpeed;
  const effectiveSpeed = calculateEffectiveSpeed(baseSpeed, slope, condId);

  // Time in seconds: distance / speed * penalty
  const travelTimeSeconds = condId === 'blocked' ? Infinity : Math.round((distance / effectiveSpeed) * cond.timePenaltyFactor);

  // Cost: distance * unitPrice * penalty
  const totalCost = condId === 'blocked' ? Infinity : Math.round(distance * unitPrice * cond.costPenaltyFactor);

  return {
    ...edge,
    fromNode: u,
    toNode: v,
    distance,
    slope,
    condition: condId,
    conditionMeta: cond,
    effectiveSpeed,
    travelTimeSeconds,
    totalCost,
    isBlocked: condId === 'blocked'
  };
}

/**
 * Builds an undirected or bi-directional adjacency map from edges.
 */
export function buildAdjacencyList(nodes, edges, defaultPrice = 12, defaultSpeed = 1.5) {
  const nodesMap = new Map(nodes.map(n => [n.id, n]));
  const adj = new Map();

  nodes.forEach(n => adj.set(n.id, []));

  edges.forEach(edge => {
    const hydrated = hydrateEdge(edge, nodesMap, defaultPrice, defaultSpeed);
    if (!hydrated) return;

    if (adj.has(edge.from)) {
      adj.get(edge.from).push({ ...hydrated, target: edge.to, direction: 'forward' });
    }
    if (adj.has(edge.to)) {
      // Reverse direction: slope is inverted
      const reverseSlope = -hydrated.slope;
      const reverseSpeed = calculateEffectiveSpeed(defaultSpeed, reverseSlope, hydrated.condition);
      const reverseTime = hydrated.isBlocked ? Infinity : Math.round((hydrated.distance / reverseSpeed) * hydrated.conditionMeta.timePenaltyFactor);

      adj.get(edge.to).push({
        ...hydrated,
        target: edge.from,
        direction: 'reverse',
        slope: reverseSlope,
        effectiveSpeed: reverseSpeed,
        travelTimeSeconds: reverseTime
      });
    }
  });

  return { adj, nodesMap };
}

/**
 * BFS: Level-by-level breadth-first reachability search.
 * Ignores blocked pipes. Returns levels, hop count, and reachability.
 */
export function runBFS(sourceId, nodes, edges, defaultPrice = 12, defaultSpeed = 1.5) {
  const { adj, nodesMap } = buildAdjacencyList(nodes, edges, defaultPrice, defaultSpeed);
  const visited = new Set([sourceId]);
  const queue = [{ id: sourceId, level: 0, path: [sourceId] }];
  const result = {
    reachable: new Map(), // id -> { level, path }
    unreachable: [],
    levels: [],
    traversalOrder: []
  };

  while (queue.length > 0) {
    const current = queue.shift();
    result.traversalOrder.push(current.id);
    result.reachable.set(current.id, {
      level: current.level,
      path: current.path
    });

    if (!result.levels[current.level]) {
      result.levels[current.level] = [];
    }
    result.levels[current.level].push(current.id);

    const neighbors = adj.get(current.id) || [];
    for (const edge of neighbors) {
      if (edge.isBlocked) continue; // blocked pipes are impassable
      if (!visited.has(edge.target)) {
        visited.add(edge.target);
        queue.push({
          id: edge.target,
          level: current.level + 1,
          path: [...current.path, edge.target]
        });
      }
    }
  }

  nodes.forEach(n => {
    if (!visited.has(n.id)) {
      result.unreachable.push(n.id);
    }
  });

  return result;
}

/**
 * DFS: Exhaustive path enumeration to find ALL possible simple paths
 * from sourceId to targetId.
 */
export function runDFSAllPaths(sourceId, targetId, nodes, edges, defaultPrice = 12, defaultSpeed = 1.5, maxPaths = 20) {
  const { adj, nodesMap } = buildAdjacencyList(nodes, edges, defaultPrice, defaultSpeed);
  const allPaths = [];
  const visited = new Set();

  function dfs(currentId, currentPath, currentEdges) {
    if (allPaths.length >= maxPaths) return;

    if (currentId === targetId) {
      // Evaluate this route outcome
      let totalDistance = 0;
      let totalCost = 0;
      let totalTime = 0;
      let hasBlocked = false;
      let issues = [];

      currentEdges.forEach(e => {
        totalDistance += e.distance;
        totalCost += e.totalCost;
        totalTime += e.travelTimeSeconds;
        if (e.isBlocked) hasBlocked = true;
        if (e.condition !== 'normal') {
          issues.push(`${e.from}->${e.to}: ${e.conditionMeta.name}`);
        }
      });

      // Reliability score out of 100
      let reliability = 100;
      currentEdges.forEach(e => {
        if (e.condition === 'leakage') reliability -= 25;
        if (e.condition === 'silt') reliability -= 20;
        if (e.condition === 'reduced_flow') reliability -= 15;
        if (e.condition === 'blocked') reliability = 0;
      });
      reliability = Math.max(0, reliability);

      allPaths.push({
        pathNodes: [...currentPath],
        pathEdges: [...currentEdges],
        hopCount: currentPath.length - 1,
        totalDistance,
        totalCost: hasBlocked ? Infinity : totalCost,
        totalTimeSeconds: hasBlocked ? Infinity : totalTime,
        totalTimeMinutes: hasBlocked ? 'N/A' : (totalTime / 60).toFixed(1),
        reliability,
        hasBlocked,
        issues,
        routeLabel: currentPath.join(' ➔ ')
      });
      return;
    }

    visited.add(currentId);

    const neighbors = adj.get(currentId) || [];
    for (const edge of neighbors) {
      if (!visited.has(edge.target)) {
        dfs(edge.target, [...currentPath, edge.target], [...currentEdges, edge]);
      }
    }

    visited.delete(currentId);
  }

  dfs(sourceId, [sourceId], []);

  // Sort paths by cost or distance, putting unblocked first
  allPaths.sort((a, b) => {
    if (a.hasBlocked && !b.hasBlocked) return 1;
    if (!a.hasBlocked && b.hasBlocked) return -1;
    return a.totalCost - b.totalCost;
  });

  return allPaths;
}

/**
 * Dijkstra's Algorithm for Single Source Shortest Path.
 * Objective: 'distance' | 'cost' | 'time' | 'balanced'
 */
export function runDijkstra(sourceId, nodes, edges, objective = 'distance', defaultPrice = 12, defaultSpeed = 1.5) {
  const { adj, nodesMap } = buildAdjacencyList(nodes, edges, defaultPrice, defaultSpeed);

  const distances = new Map();
  const previous = new Map();
  const edgeUsed = new Map();
  const unvisited = new Set();

  nodes.forEach(n => {
    distances.set(n.id, Infinity);
    previous.set(n.id, null);
    edgeUsed.set(n.id, null);
    unvisited.add(n.id);
  });

  distances.set(sourceId, 0);

  function getWeight(edge, targetNode) {
    if (edge.isBlocked) return Infinity;

    if (objective === 'distance') {
      return edge.distance;
    }
    if (objective === 'cost') {
      return edge.totalCost;
    }
    if (objective === 'time') {
      return edge.travelTimeSeconds;
    }
    if (objective === 'balanced') {
      // Balanced considers cost, time, and crop priority urgency
      const cropWeight = targetNode && targetNode.cropType ? (CROP_TYPES[targetNode.cropType]?.priorityLevel || 2) : 2;
      return (edge.totalCost * 0.4) + (edge.travelTimeSeconds * 0.5) + (cropWeight * 20);
    }
    return edge.distance;
  }

  while (unvisited.size > 0) {
    // Find unvisited node with smallest distance
    let minNode = null;
    let minVal = Infinity;
    for (const id of unvisited) {
      const d = distances.get(id);
      if (d < minVal) {
        minVal = d;
        minNode = id;
      }
    }

    if (!minNode || minVal === Infinity) break;

    unvisited.delete(minNode);

    const neighbors = adj.get(minNode) || [];
    for (const edge of neighbors) {
      if (!unvisited.has(edge.target)) continue;

      const targetNode = nodesMap.get(edge.target);
      const weight = getWeight(edge, targetNode);
      if (weight === Infinity) continue;

      const alt = distances.get(minNode) + weight;
      if (alt < distances.get(edge.target)) {
        distances.set(edge.target, alt);
        previous.set(edge.target, minNode);
        edgeUsed.set(edge.target, edge);
      }
    }
  }

  // Construct results for each node
  const results = new Map();
  nodes.forEach(n => {
    if (n.id === sourceId) {
      results.set(n.id, {
        targetId: n.id,
        isReachable: true,
        pathNodes: [sourceId],
        pathEdges: [],
        totalDistance: 0,
        totalCost: 0,
        totalTimeSeconds: 0
      });
      return;
    }

    const pathNodes = [];
    const pathEdges = [];
    let curr = n.id;

    if (distances.get(curr) === Infinity || !previous.get(curr)) {
      results.set(n.id, {
        targetId: n.id,
        isReachable: false,
        pathNodes: [],
        pathEdges: [],
        totalDistance: Infinity,
        totalCost: Infinity,
        totalTimeSeconds: Infinity
      });
      return;
    }

    while (curr && curr !== sourceId) {
      pathNodes.unshift(curr);
      const edge = edgeUsed.get(curr);
      if (edge) pathEdges.unshift(edge);
      curr = previous.get(curr);
    }
    pathNodes.unshift(sourceId);

    let totalDist = 0;
    let totalCost = 0;
    let totalTime = 0;
    pathEdges.forEach(e => {
      totalDist += e.distance;
      totalCost += e.totalCost;
      totalTime += e.travelTimeSeconds;
    });

    results.set(n.id, {
      targetId: n.id,
      isReachable: true,
      pathNodes,
      pathEdges,
      totalDistance: totalDist,
      totalCost,
      totalTimeSeconds: totalTime,
      totalTimeMinutes: (totalTime / 60).toFixed(1)
    });
  });

  return results;
}

/**
 * MASTER MULTI-FIELD ROUTE DISTRIBUTION PLAN (Union Subgraph / Steiner Irrigation Tree)
 * Computes simultaneous water delivery from Source to ALL selected target fields.
 */
export function calculateMultiFieldDistributionPlan(
  sourceId,
  selectedFieldIds,
  nodes,
  edges,
  objective = 'cost',
  defaultPrice = 12,
  defaultSpeed = 1.5
) {
  const dijkstraResults = runDijkstra(sourceId, nodes, edges, objective, defaultPrice, defaultSpeed);
  const nodesMap = new Map(nodes.map(n => [n.id, n]));
  const sourceNode = nodesMap.get(sourceId);

  // Union of all active edges across selected fields
  const activatedEdgesMap = new Map(); // edgeId -> edge
  const activeNodesSet = new Set([sourceId]);
  const fieldRoutes = [];
  let unreachableCount = 0;

  selectedFieldIds.forEach(fieldId => {
    const route = dijkstraResults.get(fieldId);
    const fieldNode = nodesMap.get(fieldId);

    if (!route || !route.isReachable) {
      unreachableCount++;
      fieldRoutes.push({
        fieldId,
        fieldNode,
        isReachable: false,
        pathNodes: [],
        pathEdges: [],
        totalDistance: 0,
        totalCost: 0,
        totalTimeSeconds: 0,
        urgencyRank: 99
      });
      return;
    }

    route.pathNodes.forEach(id => activeNodesSet.add(id));
    route.pathEdges.forEach(edge => {
      // Standardize edge key (e.g., sorted IDs so bidirectional pipes are counted once)
      const edgeKey = edge.id;
      if (!activatedEdgesMap.has(edgeKey)) {
        activatedEdgesMap.set(edgeKey, edge);
      }
    });

    // Compute urgency score for watering sequence based on crop demand & moisture
    const crop = fieldNode ? CROP_TYPES[fieldNode.cropType] : null;
    const priorityLevel = crop ? crop.priorityLevel : 3;
    const moisture = fieldNode ? (fieldNode.soilMoisture || 30) : 30;
    // Lower score = water sooner!
    const urgencyScore = priorityLevel * 30 + moisture;

    fieldRoutes.push({
      fieldId,
      fieldNode,
      isReachable: true,
      pathNodes: route.pathNodes,
      pathEdges: route.pathEdges,
      totalDistance: route.totalDistance,
      totalCost: route.totalCost,
      totalTimeSeconds: route.totalTimeSeconds,
      totalTimeMinutes: (route.totalTimeSeconds / 60).toFixed(1),
      urgencyScore
    });
  });

  // Sort field routes by agricultural urgency: Paddy & low moisture fields first!
  fieldRoutes.sort((a, b) => {
    if (!a.isReachable) return 1;
    if (!b.isReachable) return -1;
    return a.urgencyScore - b.urgencyScore;
  });

  // Calculate master network aggregated stats
  let totalDistinctPipingDistance = 0;
  let totalPipingCost = 0;
  let totalWaterLossRate = 0;
  let totalDailyWaterDemandLiters = 0;
  let maxDeliveryTimeSeconds = 0;

  activatedEdgesMap.forEach(edge => {
    totalDistinctPipingDistance += edge.distance;
    totalPipingCost += edge.totalCost;
    if (edge.condition === 'leakage') {
      totalWaterLossRate += 35;
    }
  });

  // Average water loss percentage across active pipes
  const activeEdgeCount = activatedEdgesMap.size;
  const avgWaterLossPercent = activeEdgeCount > 0 ? Math.round(totalWaterLossRate / activeEdgeCount) : 0;

  fieldRoutes.forEach(fr => {
    if (fr.isReachable) {
      if (fr.totalTimeSeconds > maxDeliveryTimeSeconds) {
        maxDeliveryTimeSeconds = fr.totalTimeSeconds;
      }
      const crop = fr.fieldNode ? CROP_TYPES[fr.fieldNode.cropType] : null;
      totalDailyWaterDemandLiters += crop ? crop.dailyRequirementLiters : 8000;
    }
  });

  // Hydraulic pumping head and power estimation (kW)
  // P = (rho * g * Q * H) / efficiency
  // Q in m3/s, H in meters head
  const maxElevDiff = Math.max(
    0,
    ...fieldRoutes.map(fr => (fr.fieldNode ? (fr.fieldNode.elevation - (sourceNode?.elevation || 0)) : 0))
  );
  const headLossFrictionMeters = Math.round(totalDistinctPipingDistance * 0.02); // ~2m head loss per 100m pipe
  const totalHeadMeters = Math.max(5, maxElevDiff + headLossFrictionMeters + 10);
  const pumpFlowRateM3S = 0.015; // ~54 m3/hr
  const pumpPowerKw = Number(((1000 * 9.81 * pumpFlowRateM3S * totalHeadMeters) / (0.75 * 1000)).toFixed(2));

  // Step-by-Step Valve Operation Sequence
  const valveSequence = [];
  fieldRoutes.forEach((route, idx) => {
    if (!route.isReachable) return;
    const crop = route.fieldNode ? CROP_TYPES[route.fieldNode.cropType] : null;
    valveSequence.push({
      step: idx + 1,
      targetField: route.fieldNode?.name || route.fieldId,
      cropName: crop?.name || 'Crops',
      cropPriority: crop?.priority || 'Medium',
      moisture: route.fieldNode?.soilMoisture || 25,
      routeTaken: route.pathNodes.join(' ➔ '),
      travelTimeMin: route.totalTimeMinutes,
      action: `Open valve along path ${route.pathNodes.join(' ➔ ')}. Deliver ~${(crop?.dailyRequirementLiters || 8000).toLocaleString()} Liters.`
    });
  });

  return {
    sourceId,
    sourceNode,
    objective,
    selectedCount: selectedFieldIds.length,
    reachableCount: selectedFieldIds.length - unreachableCount,
    unreachableCount,
    activeNodes: Array.from(activeNodesSet),
    activeEdges: Array.from(activatedEdgesMap.values()),
    fieldRoutes,
    totalDistinctPipingDistance,
    totalPipingCost,
    maxDeliveryTimeMinutes: (maxDeliveryTimeSeconds / 60).toFixed(1),
    maxDeliveryTimeSeconds,
    avgWaterLossPercent,
    totalDailyWaterDemandLiters,
    pumpPowerKw,
    totalHeadMeters,
    valveSequence
  };
}

/**
 * Auto-connects a set of nodes into a robust farm pipeline mesh network
 * Ensures every field is connected with redundant loop paths so BFS/DFS/Dijkstra have multiple choices.
 */
export function autoConnectFarmNetwork(nodes, defaultPrice = 12) {
  if (nodes.length < 2) return [];

  const sourceNode = nodes.find(n => n.type === 'source') || nodes[0];
  const fieldNodes = nodes.filter(n => n.id !== sourceNode.id);

  const edges = [];
  const edgeSet = new Set();

  function addEdge(uId, vId, condition = 'normal', diameter = 90) {
    if (uId === vId) return;
    const pairKey = [uId, vId].sort().join('-');
    if (edgeSet.has(pairKey)) return;
    edgeSet.add(pairKey);

    edges.push({
      id: `pipe_${uId}_${vId}`,
      from: uId,
      to: vId,
      condition,
      pipePricePerMeter: defaultPrice,
      diameter
    });
  }

  // 1. Connect source to the 2 nearest fields (high capacity 110mm main feeders)
  const distancesFromSource = fieldNodes.map(f => ({
    field: f,
    dist: calculateHaversineDistance(sourceNode.lat, sourceNode.lng, f.lat, f.lng)
  }));
  distancesFromSource.sort((a, b) => a.dist - b.dist);

  // Connect primary feeders from source
  const feedersCount = Math.min(3, distancesFromSource.length);
  for (let i = 0; i < feedersCount; i++) {
    addEdge(sourceNode.id, distancesFromSource[i].field.id, 'normal', 110);
  }

  // 2. Connect each field to its 2 nearest neighbor fields (creating a loop/mesh network)
  fieldNodes.forEach(f1 => {
    const neighborDistances = fieldNodes
      .filter(f2 => f2.id !== f1.id)
      .map(f2 => ({
        field: f2,
        dist: calculateHaversineDistance(f1.lat, f1.lng, f2.lat, f2.lng)
      }))
      .sort((a, b) => a.dist - b.dist);

    if (neighborDistances.length > 0) {
      addEdge(f1.id, neighborDistances[0].field.id, 'normal', 90);
    }
    if (neighborDistances.length > 1) {
      addEdge(f1.id, neighborDistances[1].field.id, 'normal', 75);
    }
  });

  return edges;
}
