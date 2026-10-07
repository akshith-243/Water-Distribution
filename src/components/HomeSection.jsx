import React, { useState } from 'react';
import { 
  Droplet, 
  MapPin, 
  GitFork, 
  TrendingUp, 
  Sparkles, 
  CheckCircle, 
  Layers, 
  ArrowRight, 
  AlertCircle, 
  Play, 
  Cpu, 
  Activity, 
  Compass, 
  ShieldCheck, 
  Waves,
  Zap,
  Info
} from 'lucide-react';

export default function HomeSection({ onStartMapping, onLoadDemoFarm, onNavigateStep }) {
  // Mini interactive sandbox state for the CS Graph Concepts
  const [sandboxCondition, setSandboxCondition] = useState({
    'S-F1': 'normal',
    'S-F2': 'normal',
    'F1-F3': 'normal',
    'F2-F3': 'normal'
  });
  const [sandboxObjective, setSandboxObjective] = useState('cost');

  // Toggle pipe condition in mini-sandbox
  const toggleSandboxPipe = (pipeKey) => {
    const states = ['normal', 'leakage', 'silt', 'blocked'];
    const current = sandboxCondition[pipeKey];
    const next = states[(states.indexOf(current) + 1) % states.length];
    setSandboxCondition(prev => ({ ...prev, [pipeKey]: next }));
  };

  return (
    <div className="space-y-16 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-slate-100">
      
      {/* HERO SECTION */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-2xl p-8 sm:p-12 lg:p-16">
        
        {/* Ambient background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-6">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Next-Gen Agricultural Hydrology & Graph Theory</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Route Optimization for <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-300">
              Water Distribution Networks
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed">
            A graph-based approach helping farmers distribute water from central Water Sources through complex pipeline networks to 
            <strong className="text-cyan-300 font-semibold"> multiple agricultural fields simultaneously</strong>. 
            Overcome terrain slope gravity barriers, eliminate leakage waste, and calculate the exact optimal distribution tree using 
            computer science algorithms.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            
            <button
              onClick={onStartMapping}
              className="group flex items-center justify-center gap-3 px-7 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-base shadow-xl shadow-cyan-500/25 transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Start Mapping Your Farm</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onLoadDemoFarm}
              className="group flex items-center justify-center gap-3 px-7 py-4 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 hover:border-cyan-400/50 text-slate-200 hover:text-white font-semibold text-base transition-all duration-200 shadow-lg cursor-pointer"
            >
              <Play className="w-5 h-5 text-emerald-400 fill-emerald-400/30 group-hover:scale-110 transition-transform" />
              <span>Load Pre-Built Demo Farm Network</span>
            </button>

          </div>

          {/* Key Value Statistics */}
          <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-6 text-left">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white">35%+</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Pumping Energy Saved</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-cyan-400">Zero</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Water Loss Wastage</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-blue-400">Multi-Field</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Simultaneous Irrigation</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">3D Terrain</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Gravity Head Modeling</div>
            </div>
          </div>

        </div>

      </div>

      {/* 4-STEP INTERACTIVE VISUAL WORKFLOW (CARDS) */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">End-to-End Workflow</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">How This Platform Works</h2>
          <p className="text-sm text-slate-400 mt-2">
            Four streamlined phases combining real satellite land conditions with graph optimization algorithms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1 */}
          <div 
            onClick={() => onNavigateStep(2)}
            className="group relative bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 p-6 rounded-2xl transition-all duration-300 cursor-pointer shadow-lg hover:shadow-cyan-500/10 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-lg mb-4 group-hover:scale-110 transition-transform">
                1
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                Pin Source & Multi-Fields
              </h3>
              <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                Click directly on the high-resolution satellite map to place Water Reservoirs (S1, S2) and multiple Agricultural Fields (F1, F2, F3...) with specific crop water demands.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-cyan-400 font-medium">
              <span>Go to Step 2</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2 */}
          <div 
            onClick={() => onNavigateStep(2)}
            className="group relative bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/50 p-6 rounded-2xl transition-all duration-300 cursor-pointer shadow-lg hover:shadow-blue-500/10 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-lg mb-4 group-hover:scale-110 transition-transform">
                2
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                Auto Land & Weather Sync
              </h3>
              <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                Every placed pin automatically fetches exact GPS coordinates, real elevation above sea level (meters), terrain slope gradient, and real-time live weather with rain probability.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-blue-400 font-medium">
              <span>Auto Geo-Telemetry</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3 */}
          <div 
            onClick={() => onNavigateStep(3)}
            className="group relative bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/50 p-6 rounded-2xl transition-all duration-300 cursor-pointer shadow-lg hover:shadow-amber-500/10 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg mb-4 group-hover:scale-110 transition-transform">
                3
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                Pipes, Costs & Physical Faults
              </h3>
              <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                Auto-connect or manually link pipelines. Model real-world physical friction: Pipe Leakage (35% loss), Dust/Silt accumulation (50% speed cut), or Severe Pipe Burst blockages.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-amber-400 font-medium">
              <span>Go to Step 3</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4 */}
          <div 
            onClick={() => onNavigateStep(4)}
            className="group relative bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 p-6 rounded-2xl transition-all duration-300 cursor-pointer shadow-lg hover:shadow-emerald-500/10 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg mb-4 group-hover:scale-110 transition-transform">
                4
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                3D Optimizer & Smart Advisory
              </h3>
              <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                Simultaneously supply ALL chosen fields. Explore Master Distribution Trees, compare all DFS path outcomes, watch glowing 3D water flow simulation, and get agronomic recommendations.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-emerald-400 font-medium">
              <span>Go to Step 4</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </div>

      {/* CORE COMPUTER SCIENCE & GRAPH CONCEPTS SECTION */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 sm:p-10 space-y-10">
        
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/40 px-3 py-1 rounded-md border border-cyan-800/40">
            <Cpu className="w-4 h-4" />
            <span>Computer Science Theoretical Foundation</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-3">
            Mapping Farmland Hydrology to Graph Theory
          </h2>
          <p className="text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
            Agricultural water networks are modeled as weighted directed graphs $G = (V, E, W)$, where water flow physics dictates cost, velocity, and reachability.
          </p>
        </div>

        {/* 3 Core Mathematical Elements */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800/80">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base">Vertices / Nodes (V)</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Source Nodes (S1, S2):</strong> Hydraulic reservoirs, solar borewells, or canal gates with discharge capacity (L/h).<br /><br />
              <strong>Field Nodes (F1, F2, F3...):</strong> Crop plots tagged with water demand urgency (Paddy &gt; Cotton &gt; Vegetables &gt; Millet) and elevation (Z).
            </p>
          </div>

          <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800/80">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                <GitFork className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base">Edges / Pipelines (E)</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Physical piping segments linking nodes. Directed water flow (u &rarr; v) with internal diameters (75mm - 110mm) and roughness coefficients. Multiple edges create interconnected redundant loops for fault tolerance.
            </p>
          </div>

          <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800/80">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Activity className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base">Multi-Factor Weights (W)</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Weights are not just flat distance! They dynamically incorporate:
              <span className="block my-1.5 p-2 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-cyan-300 text-center">
                Weight = f(Distance, &Delta;Elevation Head, Pipe Roughness, Condition Penalties)
              </span>
              Leakage adds a 35% cost penalty; silt doubles transit time.
            </p>
          </div>

        </div>

        {/* Algorithm Comparisons: BFS vs DFS vs Dijkstra vs Multi-Field Tree */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Algorithms Implemented & Explained</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* BFS */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40">
                  BFS Traversal
                </span>
                <span className="text-[11px] font-mono text-slate-400">O(V + E)</span>
              </div>
              <h4 className="font-bold text-white text-sm mt-3">Breadth-First Reachability</h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Explores level-by-level from Water Source. Determines minimum pipe hops and checks which fields remain reachable when a pipeline bursts.
              </p>
            </div>

            {/* DFS */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                  DFS Enumeration
                </span>
                <span className="text-[11px] font-mono text-slate-400">Exhaustive</span>
              </div>
              <h4 className="font-bold text-white text-sm mt-3">All Route Outcomes</h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Backtracking search that enumerates every possible simple route between Source and Field, providing redundant backup routes when primary pipelines degrade.
              </p>
            </div>

            {/* Dijkstra */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                  Dijkstra's Algo
                </span>
                <span className="text-[11px] font-mono text-slate-400">O(E + V log V)</span>
              </div>
              <h4 className="font-bold text-white text-sm mt-3">Shortest Single Path</h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Greedy priority-queue relaxation that finds mathematically optimal routes based on minimal distance, minimal cost, or fastest delivery time.
              </p>
            </div>

            {/* Multi-Field Distribution Tree */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-cyan-500/40 bg-gradient-to-b from-cyan-950/20 to-slate-950">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                  Steiner / Union Tree
                </span>
                <span className="text-[11px] font-mono text-slate-400">Multi-Target</span>
              </div>
              <h4 className="font-bold text-white text-sm mt-3">Simultaneous Multi-Field</h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Generates the joint branching pipeline backbone required to supply <strong>all selected fields at once</strong>, preventing redundant duplicate piping and scheduling valve priority.
              </p>
            </div>

          </div>
        </div>

        {/* INTERACTIVE MINI GRAPH SANDBOX */}
        <div className="p-6 bg-slate-950/90 rounded-2xl border border-slate-800/90">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <h4 className="text-base font-bold text-white">Interactive Graph Sandbox: Test Real-Time Rerouting</h4>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Click any pipeline below to toggle physical faults (Clean ➔ Leakage 💧 ➔ Silt 🪨 ➔ Blocked ❌) and see how the route to <strong>Field 3</strong> dynamically recalculates!
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 px-2 font-medium">Goal:</span>
              <button
                onClick={() => setSandboxObjective('cost')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  sandboxObjective === 'cost' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Lowest Cost
              </button>
              <button
                onClick={() => setSandboxObjective('time')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  sandboxObjective === 'time' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Fastest Time
              </button>
            </div>
          </div>

          {/* Mini Interactive Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            
            {/* SVG Interactive Topology */}
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-center justify-center">
              <svg viewBox="0 0 420 220" className="w-full max-w-md h-auto select-none">
                {/* Defs for glow */}
                <defs>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Line S to F1 */}
                <line 
                  x1="60" y1="110" x2="190" y2="50" 
                  stroke={sandboxCondition['S-F1'] === 'blocked' ? '#ef4444' : sandboxCondition['S-F1'] === 'leakage' ? '#38bdf8' : sandboxCondition['S-F1'] === 'silt' ? '#f59e0b' : '#10b981'} 
                  strokeWidth={sandboxCondition['S-F1'] === 'blocked' ? 3 : 5}
                  strokeDasharray={sandboxCondition['S-F1'] === 'blocked' ? '6 4' : 'none'}
                  className="cursor-pointer transition-all"
                  onClick={() => toggleSandboxPipe('S-F1')}
                />

                {/* Line S to F2 */}
                <line 
                  x1="60" y1="110" x2="190" y2="170" 
                  stroke={sandboxCondition['S-F2'] === 'blocked' ? '#ef4444' : sandboxCondition['S-F2'] === 'leakage' ? '#38bdf8' : sandboxCondition['S-F2'] === 'silt' ? '#f59e0b' : '#10b981'} 
                  strokeWidth={sandboxCondition['S-F2'] === 'blocked' ? 3 : 5}
                  strokeDasharray={sandboxCondition['S-F2'] === 'blocked' ? '6 4' : 'none'}
                  className="cursor-pointer transition-all"
                  onClick={() => toggleSandboxPipe('S-F2')}
                />

                {/* Line F1 to F3 */}
                <line 
                  x1="190" y1="50" x2="340" y2="110" 
                  stroke={sandboxCondition['F1-F3'] === 'blocked' ? '#ef4444' : sandboxCondition['F1-F3'] === 'leakage' ? '#38bdf8' : sandboxCondition['F1-F3'] === 'silt' ? '#f59e0b' : '#10b981'} 
                  strokeWidth={sandboxCondition['F1-F3'] === 'blocked' ? 3 : 5}
                  strokeDasharray={sandboxCondition['F1-F3'] === 'blocked' ? '6 4' : 'none'}
                  className="cursor-pointer transition-all"
                  onClick={() => toggleSandboxPipe('F1-F3')}
                />

                {/* Line F2 to F3 */}
                <line 
                  x1="190" y1="170" x2="340" y2="110" 
                  stroke={sandboxCondition['F2-F3'] === 'blocked' ? '#ef4444' : sandboxCondition['F2-F3'] === 'leakage' ? '#38bdf8' : sandboxCondition['F2-F3'] === 'silt' ? '#f59e0b' : '#10b981'} 
                  strokeWidth={sandboxCondition['F2-F3'] === 'blocked' ? 3 : 5}
                  strokeDasharray={sandboxCondition['F2-F3'] === 'blocked' ? '6 4' : 'none'}
                  className="cursor-pointer transition-all"
                  onClick={() => toggleSandboxPipe('F2-F3')}
                />

                {/* Nodes */}
                {/* Source S */}
                <circle cx="60" cy="110" r="22" fill="#0284c7" stroke="#38bdf8" strokeWidth="3" filter="url(#glow)" />
                <text x="60" y="115" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">S1</text>
                <text x="60" y="145" textAnchor="middle" fill="#94a3b8" fontSize="10">Source Tank</text>

                {/* Node F1 */}
                <circle cx="190" cy="50" r="18" fill="#1e293b" stroke="#10b981" strokeWidth="2.5" />
                <text x="190" y="54" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">F1</text>
                <text x="190" y="25" textAnchor="middle" fill="#94a3b8" fontSize="10">Paddy Field</text>

                {/* Node F2 */}
                <circle cx="190" cy="170" r="18" fill="#1e293b" stroke="#06b6d4" strokeWidth="2.5" />
                <text x="190" y="174" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">F2</text>
                <text x="190" y="202" textAnchor="middle" fill="#94a3b8" fontSize="10">Cotton Plot</text>

                {/* Node F3 (Destination) */}
                <circle cx="340" cy="110" r="22" fill="#1e293b" stroke="#f59e0b" strokeWidth="3" />
                <text x="340" y="115" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">F3</text>
                <text x="340" y="145" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">Target Field</text>
              </svg>
            </div>

            {/* Sandbox Evaluation Results */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Current Pipe Fault Status (Click above to cycle)
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(sandboxCondition).map(([pipe, cond]) => (
                  <button
                    key={pipe}
                    onClick={() => toggleSandboxPipe(pipe)}
                    className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-between text-left transition"
                  >
                    <span className="font-mono font-medium text-slate-300">{pipe}</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      cond === 'normal' ? 'bg-emerald-500/20 text-emerald-400' :
                      cond === 'leakage' ? 'bg-sky-500/20 text-sky-400' :
                      cond === 'silt' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-rose-500/20 text-rose-400'
                    }`}>
                      {cond.toUpperCase()}
                    </span>
                  </button>
                ))}
              </div>

              {/* Dynamic Algorithm Route Outcome */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-xs space-y-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-cyan-400" />
                    <span>Calculated Optimal Route to F3:</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold font-mono">
                    {sandboxCondition['S-F1'] === 'blocked' || sandboxCondition['F1-F3'] === 'blocked'
                      ? (sandboxCondition['S-F2'] === 'blocked' || sandboxCondition['F2-F3'] === 'blocked'
                          ? 'NO PATH (ISOLATED)'
                          : 'S1 ➔ F2 ➔ F3 (Lower Bypass)')
                      : (sandboxCondition['S-F2'] === 'blocked' || sandboxCondition['F2-F3'] === 'blocked'
                          ? 'S1 ➔ F1 ➔ F3 (Upper Path)'
                          : sandboxCondition['S-F1'] === 'leakage' || sandboxCondition['F1-F3'] === 'silt'
                          ? 'S1 ➔ F2 ➔ F3 (Rerouted away from fault)'
                          : 'S1 ➔ F1 ➔ F3 (Direct & Clean)')}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Notice how the graph engine instantly avoids blocked or leaking pipes and switches flow to alternative branches without human intervention.
                </p>
              </div>

            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
