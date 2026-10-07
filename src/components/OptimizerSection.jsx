import React, { useState, useMemo } from 'react';
import { 
  Box, 
  CheckSquare, 
  Square, 
  Layers, 
  Zap, 
  DollarSign, 
  Clock, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  ShieldCheck, 
  Download, 
  Printer, 
  Sparkles, 
  ArrowRight, 
  Droplet, 
  Wind, 
  CloudRain, 
  Cpu, 
  ListOrdered, 
  Compass,
  RotateCw
} from 'lucide-react';
import { CROP_TYPES, SOIL_TYPES } from '../constants';
import { 
  calculateMultiFieldDistributionPlan, 
  runDFSAllPaths, 
  runBFS 
} from '../utils/graphAlgorithms';
import FarmVisualizer3D from './FarmVisualizer3D';

export default function OptimizerSection({
  nodes,
  edges,
  pipePricePerMeter,
  baseFlowSpeed,
  weatherData,
  onNavigateStep
}) {
  const sourceNode = nodes.find(n => n.type === 'source') || nodes[0];
  const allFieldNodes = useMemo(() => nodes.filter(n => n.type === 'field'), [nodes]);

  // Selected fields (Farmer can select all or any subset)
  const [selectedFieldIds, setSelectedFieldIds] = useState(() => allFieldNodes.map(f => f.id));
  
  // Active view tab: 'master' (View 1) | 'all_routes' (View 2)
  const [activeView, setActiveView] = useState('master');
  
  // Optimization Objective: 'cost' | 'distance' | 'time' | 'balanced'
  const [objective, setObjective] = useState('cost');

  // Selected field for DFS detailed deep-dive in View 2
  const [inspectedFieldId, setInspectedFieldId] = useState(allFieldNodes[0]?.id || '');

  // Select / Deselect All Fields Toggle
  const isAllSelected = selectedFieldIds.length === allFieldNodes.length && allFieldNodes.length > 0;
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedFieldIds([]);
    } else {
      setSelectedFieldIds(allFieldNodes.map(f => f.id));
    }
  };

  const toggleFieldSelection = (fieldId) => {
    setSelectedFieldIds(prev =>
      prev.includes(fieldId) ? prev.filter(id => id !== fieldId) : [...prev, fieldId]
    );
  };

  // 1. Calculate Master Multi-Field Distribution Plan (Union Distribution Tree)
  const masterPlan = useMemo(() => {
    if (!sourceNode || selectedFieldIds.length === 0) return null;
    return calculateMultiFieldDistributionPlan(
      sourceNode.id,
      selectedFieldIds,
      nodes,
      edges,
      objective,
      pipePricePerMeter,
      baseFlowSpeed
    );
  }, [sourceNode, selectedFieldIds, nodes, edges, objective, pipePricePerMeter, baseFlowSpeed]);

  // 2. Calculate All Possible Route Outcomes (DFS Exhaustive Path Enumeration) for inspected field
  const dfsAllPaths = useMemo(() => {
    if (!sourceNode || !inspectedFieldId) return [];
    return runDFSAllPaths(sourceNode.id, inspectedFieldId, nodes, edges, pipePricePerMeter, baseFlowSpeed, 20);
  }, [sourceNode, inspectedFieldId, nodes, edges, pipePricePerMeter, baseFlowSpeed]);

  // BFS Reachability Check
  const bfsResult = useMemo(() => {
    if (!sourceNode) return null;
    return runBFS(sourceNode.id, nodes, edges, pipePricePerMeter, baseFlowSpeed);
  }, [sourceNode, nodes, edges, pipePricePerMeter, baseFlowSpeed]);

  // Export Plan to JSON
  const handleExportPlan = () => {
    if (!masterPlan) return;
    const exportData = {
      timestamp: new Date().toISOString(),
      farmLocation: weatherData?.farmLocationName || 'Custom Farm',
      objective,
      weatherSync: weatherData,
      masterPlan: {
        totalDistanceMeters: masterPlan.totalDistinctPipingDistance,
        totalCost: masterPlan.totalPipingCost,
        maxDeliveryTimeMinutes: masterPlan.maxDeliveryTimeMinutes,
        avgWaterLossPercent: masterPlan.avgWaterLossPercent,
        totalDailyWaterDemandLiters: masterPlan.totalDailyWaterDemandLiters,
        pumpPowerKw: masterPlan.pumpPowerKw,
        valveSequence: masterPlan.valveSequence,
        fieldRoutes: masterPlan.fieldRoutes.map(fr => ({
          field: fr.fieldNode?.name,
          crop: fr.fieldNode?.cropType,
          path: fr.pathNodes.join(' -> '),
          distance: fr.totalDistance,
          cost: fr.totalCost,
          timeMinutes: fr.totalTimeMinutes
        }))
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `water-distribution-plan-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-slate-100">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/40 px-2.5 py-0.5 rounded border border-cyan-800/40 mb-2">
            <Box className="w-3.5 h-3.5" />
            <span>Step 4: Multi-Field Optimizer & 3D Simulation</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            3D Multi-Field Route Optimizer & Smart Agronomic Advisory
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Simultaneously deliver water to all selected fields. Analyze joint distribution networks, compare all alternative DFS routes, and inspect 3D terrain hydraulic flow.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPlan}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export Irrigation Plan</span>
          </button>
        </div>
      </div>

      {/* MULTI-FIELD SELECTION & OPTIMIZATION CONTROLS BAR */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-lg space-y-4">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Target Fields Multi-Selection */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Target Agricultural Fields To Irrigate:
              </span>
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition"
              >
                {isAllSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                <span>{isAllSelected ? 'Deselect All' : 'Select All Fields'}</span>
              </button>
            </div>

            {/* Individual Checkbox Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {allFieldNodes.map(field => {
                const isSelected = selectedFieldIds.includes(field.id);
                const crop = CROP_TYPES[field.cropType];
                return (
                  <button
                    key={field.id}
                    onClick={() => toggleFieldSelection(field.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 border-cyan-500 text-white shadow-md ring-1 ring-cyan-500/40'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{crop?.icon}</span>
                    <span>{field.id}: {field.name.split(':')[1] || field.name}</span>
                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-cyan-400' : 'bg-slate-700'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optimization Goal Objective Selector */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Routing Optimization Goal:
            </span>
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setObjective('cost')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                  objective === 'cost' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Lowest Cost</span>
              </button>

              <button
                onClick={() => setObjective('distance')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                  objective === 'distance' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Shortest Distance</span>
              </button>

              <button
                onClick={() => setObjective('time')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                  objective === 'time' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Fastest Time</span>
              </button>

              <button
                onClick={() => setObjective('balanced')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                  objective === 'balanced' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Balanced AI</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* 3D INTERACTIVE TERRAIN & FLOW SIMULATION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h3 className="text-base font-bold text-white">Live 3D Farmland & Flowing Water Particle Simulation</h3>
          </div>
          <span className="text-xs text-slate-400">
            Pipes dynamically glow with real flowing water particles along optimal paths
          </span>
        </div>

        <FarmVisualizer3D
          nodes={nodes}
          edges={edges}
          activeEdges={masterPlan?.activeEdges || []}
        />
      </div>

      {/* TWO PRIMARY VIEWS TABS */}
      <div className="space-y-6">
        
        {/* Navigation Tabs between View 1 and View 2 */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveView('master')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeView === 'master'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>View 1 — Master Multi-Field Distribution Plan</span>
          </button>

          <button
            onClick={() => setActiveView('all_routes')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeView === 'all_routes'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>View 2 — All Possible Route Outcomes (DFS Enumeration)</span>
          </button>
        </div>

        {/* VIEW 1: MASTER MULTI-FIELD DISTRIBUTION PLAN */}
        {activeView === 'master' && masterPlan && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Master Key Performance Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Distinct Pipe Length</span>
                <div className="text-xl font-black text-white mt-1">
                  {masterPlan.totalDistinctPipingDistance.toLocaleString()} m
                </div>
                <span className="text-[10px] text-slate-500">Shared trunks combined</span>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Distribution Cost</span>
                <div className="text-xl font-black text-cyan-400 mt-1">
                  ${masterPlan.totalPipingCost.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-500">CapEx + Loss factor</span>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Max Delivery Time</span>
                <div className="text-xl font-black text-emerald-400 mt-1">
                  {masterPlan.maxDeliveryTimeMinutes} min
                </div>
                <span className="text-[10px] text-slate-500">To furthest parcel</span>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Water Delivery Volume</span>
                <div className="text-xl font-black text-blue-400 mt-1">
                  {(masterPlan.totalDailyWaterDemandLiters / 1000).toFixed(1)} kL
                </div>
                <span className="text-[10px] text-slate-500">Total daily demand</span>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Average Water Loss</span>
                <div className={`text-xl font-black mt-1 ${masterPlan.avgWaterLossPercent > 10 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {masterPlan.avgWaterLossPercent}%
                </div>
                <span className="text-[10px] text-slate-500">From detected leaks</span>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Pump Power Head</span>
                <div className="text-xl font-black text-purple-400 mt-1">
                  {masterPlan.pumpPowerKw} kW
                </div>
                <span className="text-[10px] text-slate-500">{masterPlan.totalHeadMeters}m total head</span>
              </div>

            </div>

            {/* Optimal Routing Tree Summary Table */}
            <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-white">Optimal Multi-Field Path Breakdown</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Individual optimal paths connecting Water Source {sourceNode.id} to each field simultaneously.
                  </p>
                </div>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 px-3 py-1 rounded-lg border border-cyan-800/40">
                  {masterPlan.reachableCount} / {masterPlan.selectedCount} Fields Supplied
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Field / Crop</th>
                      <th className="py-3 px-4">Urgency Rank</th>
                      <th className="py-3 px-4">Optimal Pipeline Path</th>
                      <th className="py-3 px-4">Distance</th>
                      <th className="py-3 px-4">Transit Time</th>
                      <th className="py-3 px-4">Cost</th>
                      <th className="py-3 px-4">Soil Moisture</th>
                      <th className="py-3 px-4">Reachability</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {masterPlan.fieldRoutes.map((fr, idx) => {
                      const crop = fr.fieldNode ? CROP_TYPES[fr.fieldNode.cropType] : null;
                      return (
                        <tr key={fr.fieldId} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4 font-bold text-white">
                            <div className="flex items-center gap-2">
                              <span>{crop?.icon}</span>
                              <div>
                                <div>{fr.fieldNode?.name}</div>
                                <span className={`text-[10px] font-bold ${crop?.bgLight} px-1.5 py-0.2 rounded`}>
                                  {crop?.priority} Priority
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="w-6 h-6 rounded-full bg-slate-800 text-cyan-300 font-bold flex items-center justify-center text-xs">
                              #{idx + 1}
                            </span>
                          </td>

                          <td className="py-3 px-4 font-mono font-bold text-cyan-300">
                            {fr.isReachable ? fr.pathNodes.join(' ➔ ') : 'NO VIABLE PATH'}
                          </td>

                          <td className="py-3 px-4 font-semibold text-white">
                            {fr.isReachable ? `${fr.totalDistance} m` : '—'}
                          </td>

                          <td className="py-3 px-4 text-slate-300">
                            {fr.isReachable ? `${fr.totalTimeMinutes} min` : '—'}
                          </td>

                          <td className="py-3 px-4 font-bold text-emerald-400">
                            {fr.isReachable ? `$${fr.totalCost.toLocaleString()}` : '—'}
                          </td>

                          <td className="py-3 px-4 text-cyan-300">
                            {fr.fieldNode?.soilMoisture}%
                          </td>

                          <td className="py-3 px-4">
                            {fr.isReachable ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center gap-1 w-fit">
                                <CheckCircle className="w-3 h-3" />
                                <span>Optimal</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-bold text-[10px] flex items-center gap-1 w-fit">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Severed</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>

            {/* RECOMMENDED WATERING SEQUENCE & VALVE OPERATION SCHEDULE */}
            <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-cyan-400" />
                <h4 className="text-base font-bold text-white">
                  Chronological Valve Operation Schedule (Agronomic Priority Order)
                </h4>
              </div>
              <p className="text-xs text-slate-400">
                Turn on distribution valves in this precise sequence. Crops with critical water urgency (e.g. Paddy with lowest moisture) are prioritized first to prevent moisture stress.
              </p>

              <div className="space-y-2.5">
                {masterPlan.valveSequence.map(seq => (
                  <div
                    key={seq.step}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 font-bold flex items-center justify-center text-xs">
                        {seq.step}
                      </div>
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{seq.targetField}</span>
                          <span className="text-[10px] font-semibold text-slate-400">
                            ({seq.cropName} • {seq.cropPriority} Priority)
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{seq.action}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Est. Transit Time:</span>
                      <span className="text-cyan-300 font-bold">{seq.travelTimeMin} min</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* VIEW 2: ALL POSSIBLE ROUTE OUTCOMES (DFS ENUMERATION) */}
        {activeView === 'all_routes' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Target Field Selector for DFS Deep-Dive */}
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white">Select Destination Field to Inspect All Routes:</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Depth-First Search (DFS) exhaustively finds every non-cyclic path through the pipeline mesh.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {allFieldNodes.map(field => {
                  const isCurrent = inspectedFieldId === field.id;
                  const crop = CROP_TYPES[field.cropType];
                  return (
                    <button
                      key={field.id}
                      onClick={() => setInspectedFieldId(field.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                        isCurrent
                          ? 'bg-cyan-600 border-cyan-500 text-white shadow-md shadow-cyan-500/20'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {crop?.icon} {field.id} ({field.name.split(':')[0]})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DFS Outcomes Comparison Matrix */}
            <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-white">
                    All Discovered Route Outcomes for {inspectedFieldId} ({dfsAllPaths.length} Routes Found)
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Compare distance, delivery time, pipe cost, and reliability score across all possible pathways.
                  </p>
                </div>
              </div>

              {dfsAllPaths.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
                  No routes found. Ensure pipelines are connected in Step 3.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Route Classification</th>
                        <th className="py-3 px-4">Node Path Sequence</th>
                        <th className="py-3 px-4">Hops</th>
                        <th className="py-3 px-4">Distance (m)</th>
                        <th className="py-3 px-4">Travel Time (min)</th>
                        <th className="py-3 px-4">Cost ($)</th>
                        <th className="py-3 px-4">Reliability</th>
                        <th className="py-3 px-4">Bottlenecks / Issues</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {dfsAllPaths.map((route, idx) => {
                        const isOptimal = idx === 0 && !route.hasBlocked;
                        return (
                          <tr
                            key={idx}
                            className={`transition ${
                              isOptimal
                                ? 'bg-cyan-950/30 hover:bg-cyan-950/50'
                                : route.hasBlocked
                                ? 'bg-rose-950/20 opacity-60'
                                : 'hover:bg-slate-800/40'
                            }`}
                          >
                            <td className="py-3 px-4 font-bold">
                              {isOptimal ? (
                                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px]">
                                  🏆 Optimal Route
                                </span>
                              ) : route.hasBlocked ? (
                                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px]">
                                  ❌ Blocked / Severed
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px]">
                                  🔄 Alternate Backup #{idx}
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-4 font-mono font-bold text-white">
                              {route.routeLabel}
                            </td>

                            <td className="py-3 px-4 text-slate-400 font-medium">
                              {route.hopCount} pipes
                            </td>

                            <td className="py-3 px-4 font-bold text-white">
                              {route.totalDistance} m
                            </td>

                            <td className="py-3 px-4 text-slate-300">
                              {route.totalTimeMinutes} min
                            </td>

                            <td className="py-3 px-4 font-bold text-emerald-400">
                              {route.hasBlocked ? '∞' : `$${route.totalCost.toLocaleString()}`}
                            </td>

                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <div className="w-12 bg-slate-900 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`h-full ${
                                      route.reliability >= 80 ? 'bg-emerald-400' : route.reliability >= 50 ? 'bg-amber-400' : 'bg-rose-400'
                                    }`}
                                    style={{ width: `${route.reliability}%` }}
                                  />
                                </div>
                                <span className="text-[11px] font-bold text-slate-300">{route.reliability}%</span>
                              </div>
                            </td>

                            <td className="py-3 px-4 text-slate-400 text-[11px]">
                              {route.issues.length > 0 ? (
                                <span className="text-amber-400 font-medium">{route.issues.join(', ')}</span>
                              ) : (
                                <span className="text-emerald-400">All pipes clean</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

            </div>

          </div>
        )}

      </div>

      {/* SMART AGRICULTURAL SUGGESTIONS & WEATHER AI ADVISORY */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Smart Agricultural Suggestions & Live Weather Advisory</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated agronomic recommendations driven by live GPS weather telemetry and soil physics.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Weather Alert Advice */}
          <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <CloudRain className="w-5 h-5 text-blue-400" />
              <h5 className="font-bold text-white text-xs uppercase tracking-wider">Live Weather Recommendation</h5>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {weatherData?.advisory || 'Syncing real-time satellite meteorology...'}
            </p>
            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Rain Probability: <strong>{weatherData?.rainProbMax || 0}%</strong></span>
              <span>Air Temp: <strong>{weatherData?.temp || 28}°C</strong></span>
            </div>
          </div>

          {/* Soil Retention Advice */}
          <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <Droplet className="w-5 h-5 text-cyan-400" />
              <h5 className="font-bold text-white text-xs uppercase tracking-wider">Soil Retention & Drainage</h5>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Black Cotton soil plots retain water 48-52 hours longer than Red Sandy Loam. For Sandy Loam fields (such as Field 3), apply smaller volumetric pulses at higher frequency to minimize percolation loss.
            </p>
            <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-cyan-300">
              Tip: Stagger irrigation intervals by +4 hours on clayey basins.
            </div>
          </div>

          {/* Pipe Maintenance & Energy Alert */}
          <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h5 className="font-bold text-white text-xs uppercase tracking-wider">Urgent Hydraulic Maintenance</h5>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {masterPlan?.avgWaterLossPercent > 0 ? (
                <span>Detected <strong>{masterPlan.avgWaterLossPercent}% water loss</strong> across active pipes! Repairing leaking gaskets will save approximately <strong>${(masterPlan.totalPipingCost * 0.25).toFixed(0)}</strong> in wasted pumping energy this season.</span>
              ) : (
                <span>Pipeline infrastructure is currently optimal. All active paths operating at 100% hydraulic efficiency with minimal frictional head loss.</span>
              )}
            </p>
            <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-emerald-400">
              Estimated Pump Power: {masterPlan?.pumpPowerKw} kW head requirement.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
