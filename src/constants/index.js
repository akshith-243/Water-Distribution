export const CROP_TYPES = {
  paddy: {
    id: 'paddy',
    name: 'Paddy / Rice',
    icon: '🌾',
    demandLabel: 'High Water Demand',
    priority: 'Critical',
    priorityLevel: 1, // 1 is highest priority
    waterRequirementMm: 1200,
    dailyRequirementLiters: 18000,
    color: '#10b981', // emerald
    bgLight: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    description: 'Continuous submergence or alternate wetting/drying needed. Moisture stress drastically cuts yield.'
  },
  cotton: {
    id: 'cotton',
    name: 'Cotton / Sugarcane',
    icon: '🌱',
    demandLabel: 'Medium-High Demand',
    priority: 'High',
    priorityLevel: 2,
    waterRequirementMm: 850,
    dailyRequirementLiters: 12500,
    color: '#06b6d4', // cyan
    bgLight: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    description: 'Requires steady root-zone moisture during flowering and boll formation.'
  },
  vegetables: {
    id: 'vegetables',
    name: 'Vegetables / Drip Crops',
    icon: '🍅',
    demandLabel: 'Precision Frequent',
    priority: 'Medium',
    priorityLevel: 3,
    waterRequirementMm: 450,
    dailyRequirementLiters: 7000,
    color: '#f59e0b', // amber
    bgLight: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    description: 'Shallow root system; requires high-frequency micro-irrigation to avoid wilting.'
  },
  millet: {
    id: 'millet',
    name: 'Millet / Pulses',
    icon: '🌽',
    demandLabel: 'Low Water Demand',
    priority: 'Standard',
    priorityLevel: 4,
    waterRequirementMm: 300,
    dailyRequirementLiters: 4200,
    color: '#8b5cf6', // purple
    bgLight: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    description: 'Drought-hardy crop with deep taproots; can tolerate dry spells without yield collapse.'
  }
};

export const SOIL_TYPES = {
  black_cotton: {
    id: 'black_cotton',
    name: 'Black Cotton Soil (Regur)',
    waterRetention: 'Very High (48-52%)',
    drainage: 'Slow Infiltration',
    color: '#334155',
    moistureBase: 38,
    advisory: 'Holds moisture for prolonged periods. Space watering cycles further apart to avoid root asphyxiation.'
  },
  red_sandy_loam: {
    id: 'red_sandy_loam',
    name: 'Red Sandy Loam',
    waterRetention: 'Moderate (22-26%)',
    drainage: 'Rapid Infiltration',
    color: '#b45309',
    moistureBase: 22,
    advisory: 'Quick draining soil. Benefit from shorter, more frequent irrigation cycles.'
  },
  alluvial_clay: {
    id: 'alluvial_clay',
    name: 'Alluvial Clay Loam',
    waterRetention: 'High (34-38%)',
    drainage: 'Balanced Optimal',
    color: '#047857',
    moistureBase: 32,
    advisory: 'Ideal moisture buffer capacity. Excellent response to gravity-fed furrow and drip systems.'
  }
};

export const PIPE_CONDITIONS = {
  normal: {
    id: 'normal',
    name: 'Normal Clean Pipe',
    icon: '✅',
    flowEfficiency: 1.0, // 100%
    speedMultiplier: 1.0,
    timePenaltyFactor: 1.0,
    costPenaltyFactor: 1.0, // 0% extra loss
    waterLossPercent: 0,
    statusColor: '#10b981',
    badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    description: 'Clean bore, zero leaks, 100% flow efficiency.'
  },
  leakage: {
    id: 'leakage',
    name: 'Pipe Leakage',
    icon: '💧',
    flowEfficiency: 0.65,
    speedMultiplier: 0.9,
    timePenaltyFactor: 1.15,
    costPenaltyFactor: 1.35, // +35% cost penalty due to water loss
    waterLossPercent: 35,
    statusColor: '#38bdf8',
    badgeClass: 'bg-sky-500/20 text-sky-400 border-sky-500/40',
    description: 'Pinhole/gasket fissure. Loses 35% water volume & drops operating pressure.'
  },
  silt: {
    id: 'silt',
    name: 'Dust / Silt Stuck',
    icon: '🪨',
    flowEfficiency: 0.50,
    speedMultiplier: 0.5, // 50% slower velocity
    timePenaltyFactor: 2.0, // doubles travel time
    costPenaltyFactor: 1.25,
    waterLossPercent: 5,
    statusColor: '#f59e0b',
    badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    description: 'Sediment build-up narrows internal lumen; halves water velocity (2x travel time).'
  },
  reduced_flow: {
    id: 'reduced_flow',
    name: 'Reduced Flow / Low Pressure',
    icon: '📉',
    flowEfficiency: 0.70,
    speedMultiplier: 0.71,
    timePenaltyFactor: 1.40, // +40% travel time
    costPenaltyFactor: 1.15,
    waterLossPercent: 8,
    statusColor: '#f97316',
    badgeClass: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    description: 'Partial airlock or throttling valve; flow velocity slowed by 40%.'
  },
  blocked: {
    id: 'blocked',
    name: 'Blocked / Burst Pipeline',
    icon: '❌',
    flowEfficiency: 0.0,
    speedMultiplier: 0.0,
    timePenaltyFactor: Infinity,
    costPenaltyFactor: Infinity,
    waterLossPercent: 100,
    statusColor: '#ef4444',
    badgeClass: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
    description: 'Complete obstruction or rupture! Water cannot pass. Reroute required.'
  }
};

// Realistic pre-built demo farm network (Punjab Agro Basin)
export const DEMO_FARM_DATA = {
  center: [30.9015, 75.8560],
  zoom: 16,
  nodes: [
    {
      id: 'S1',
      type: 'source',
      name: 'Main Elevated Reservoir & Borewell S1',
      lat: 30.9042,
      lng: 75.8540,
      elevation: 232, // meters
      sourceCapacity: 60000, // L/hr
      sourceType: 'Elevated Tank & Solar Pump'
    },
    {
      id: 'F1',
      type: 'field',
      name: 'Field 1: North Paddy Basin',
      lat: 30.9030,
      lng: 75.8585,
      elevation: 224, // downhill from S1
      cropType: 'paddy',
      soilType: 'black_cotton',
      soilMoisture: 32, // %
      areaAcre: 3.5
    },
    {
      id: 'F2',
      type: 'field',
      name: 'Field 2: East Sugarcane & Cotton Plot',
      lat: 30.9008,
      lng: 75.8602,
      elevation: 227,
      cropType: 'cotton',
      soilType: 'alluvial_clay',
      soilMoisture: 28,
      areaAcre: 4.0
    },
    {
      id: 'F3',
      type: 'field',
      name: 'Field 3: Valley Drip Vegetables',
      lat: 30.8985,
      lng: 75.8572,
      elevation: 219, // lowest point (valley)
      cropType: 'vegetables',
      soilType: 'red_sandy_loam',
      soilMoisture: 20,
      areaAcre: 2.2
    },
    {
      id: 'F4',
      type: 'field',
      name: 'Field 4: South Terrace Millet & Pulses',
      lat: 30.8992,
      lng: 75.8518,
      elevation: 235, // uphill from S1!
      cropType: 'millet',
      soilType: 'red_sandy_loam',
      soilMoisture: 24,
      areaAcre: 3.0
    },
    {
      id: 'F5',
      type: 'field',
      name: 'Field 5: Central Organic Paddy Field',
      lat: 30.9018,
      lng: 75.8552,
      elevation: 225,
      cropType: 'paddy',
      soilType: 'alluvial_clay',
      soilMoisture: 29,
      areaAcre: 2.8
    }
  ],
  edges: [
    // Multiple paths to allow BFS, DFS and Dijkstra to demonstrate trade-offs
    { id: 'e1', from: 'S1', to: 'F1', condition: 'normal', pipePricePerMeter: 12, diameter: 110 },
    { id: 'e2', from: 'S1', to: 'F5', condition: 'normal', pipePricePerMeter: 12, diameter: 110 },
    { id: 'e3', from: 'S1', to: 'F4', condition: 'leakage', pipePricePerMeter: 12, diameter: 90 }, // Leakage on uphill pipe
    { id: 'e4', from: 'F1', to: 'F2', condition: 'normal', pipePricePerMeter: 12, diameter: 90 },
    { id: 'e5', from: 'F5', to: 'F2', condition: 'reduced_flow', pipePricePerMeter: 12, diameter: 90 }, // Low pressure
    { id: 'e6', from: 'F5', to: 'F3', condition: 'normal', pipePricePerMeter: 12, diameter: 90 },
    { id: 'e7', from: 'F2', to: 'F3', condition: 'silt', pipePricePerMeter: 12, diameter: 75 }, // Silt stuck
    { id: 'e8', from: 'F4', to: 'F3', condition: 'normal', pipePricePerMeter: 12, diameter: 75 },
    { id: 'e9', from: 'F5', to: 'F4', condition: 'normal', pipePricePerMeter: 12, diameter: 75 }
  ]
};

export const PRESET_FARMS = [
  {
    name: 'Punjab Agro Basin (Paddy & Cotton)',
    region: 'Punjab, India',
    coords: [30.9015, 75.8560],
    description: 'High-density canal and borewell irrigation with paddy and cotton rotations.'
  },
  {
    name: 'California Central Valley (Vegetables & Orchards)',
    region: 'Fresno County, CA, USA',
    coords: [36.7468, -119.7726],
    description: 'Precision drip and micro-sprinkler networks with strict water budgeting.'
  },
  {
    name: 'Krishna-Godavari Delta Farmland',
    region: 'Andhra Pradesh, India',
    coords: [16.5062, 80.6480],
    description: 'Alluvial soils with gravity-assisted canal feeders and high humidity.'
  },
  {
    name: 'Nile Delta Irrigated Paddies',
    region: 'Mansoura, Egypt',
    coords: [31.0409, 31.3785],
    description: 'Flat alluvial basin with interconnected channel distribution.'
  }
];
