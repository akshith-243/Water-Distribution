import React, { useState, useMemo } from 'react';
import { 
  GitFork, 
  Zap, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  TrendingDown, 
  Sliders, 
  ArrowRight, 
  DollarSign, 
  Gauge, 
  HelpCircle,
  ShieldAlert,
  RotateCcw
} from 'lucide-react';
import { PIPE_CONDITIONS } from '../constants';
import { 
  autoConnectFarmNetwork, 
  hydrateEdge, 
  calculate3DDistance,
  calculateEffectiveSpeed 
} from '../utils/graphAlgorithms';

export default function PipelineSection({
  nodes,
  edges,
  setEdges,
  pipePricePerMeter,
  setPipePricePerMeter,
  baseFlowSpeed,
  setBaseFlowSpeed,
  onProceedToStep4
}) {
  const [manualFrom, setManualFrom] = useState('');
  const [manualTo, setManualTo] = useState('');
  const [manualDiameter, setManualDiameter] = useState(90);
  const [editingEdgeId, setEditingEdgeId] = useState(null);
  const [manualDistanceOverride, setManualDistanceOverride] = useState('');

  // Map of nodes for fast lookup
  const nodesMap = useMemo(() => new Map(nodes.map(n => [n.id, n])), [nodes]);

  // Hydrate all edges with live distance, slope, speed, travel time, and cost
  const hydratedEdges = useMemo(() => {
    return edges.map(edge => hydrateEdge(edge, nodesMap, pipePricePerMeter, baseFlowSpeed)).filter(Boolean);
  }, [edges, nodesMap, pipePricePerMeter, baseFlowSpeed]);

  // Network aggregated metrics
  const networkMetrics = useMemo(() => {
    let totalDist = 0;
    let totalCost = 0;
    let blockedCount = 0;
    let leakCount = 0;
    let siltCount = 0;

    hydratedEdges.forEach(e => {
      totalDist += e.distance;
      if (!e.isBlocked) {
        totalCost += e.totalCost;
      } else {
        blockedCount++;
      }
      if (e.condition === 'leakage') leakCount++;
      if (e.condition === 'silt') siltCount++;
    });

    return {
      totalDist,
      totalCost,
      blockedCount,
      leakCount,
      siltCount,
      totalCount: edges.length
    };
  }, [hydratedEdges, edges.length]);

  // Auto-connect farm pipeline network
  const handleAutoConnect = () => {
    const newEdges = autoConnectFarmNetwork(nodes, pipePricePerMeter);
    setEdges(newEdges);
  };

  // Add manual edge
  const handleAddManualEdge = (e) => {
    e.preventDefault();
    if (!manualFrom || !manualTo || manualFrom === manualTo) return;

    // Check if already exists
    const exists = edges.some(
      edge => (edge.from === manualFrom && edge.to === manualTo) || (edge.from === manualTo && edge.to === manualFrom)
    );
    if (exists) {
      alert('A pipeline already exists between these two parcels!');
      return;
    }

    const newEdge = {
      id: `pipe_${manualFrom}_${manualTo}_${Date.now().toString().slice(-4)}`,
      from: manualFrom,
      to: manualTo,
      condition: 'normal',
      pipePricePerMeter,
      diameter: Number(manualDiameter)
    };

    setEdges(prev => [...prev, newEdge]);
    setManualFrom('');
    setManualTo('');
  };

  // Update condition of an edge
  const handleUpdateCondition = (edgeId, newCondition) => {
    setEdges(prev =>
      prev.map(e => (e.id === edgeId ? { ...e, condition: newCondition } : e))
    );
  };

  // Delete an edge
  const handleDeleteEdge = (edgeId) => {
    setEdges(prev => prev.filter(e => e.id !== edgeId));
  };

  // Reset all pipes to clean normal condition
  const handleClearAllFaults = () => {
    setEdges(prev => prev.map(e => ({ ...e, condition: 'normal' })));
  };

  // Inject a simulated fault scenario for quick testing
  const handleInjectFaultScenario = () => {
    if (edges.length === 0) return;
    setEdges(prev =>
      prev.map((e, idx) => {
        if (idx === 0) return { ...e, condition: 'leakage' };
        if (idx === 2) return { ...e, condition: 'silt' };
        if (idx === 4) return { ...e, condition: 'blocked' };
        return e;
      })
    );
  };

  return (
    <div className="space-y-8 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-slate-100">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/40 px-2.5 py-0.5 rounded border border-cyan-800/40 mb-2">
            <GitFork className="w-3.5 h-3.5" />
            <span>Step 3: Pipeline Network & Real-World Physics</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Pipeline Mesh Network & Flow Degradation Factors
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Build multi-path agricultural pipelines between parcels. Simulate real-world faults: leakages, silt clogs, low pressure, and pipe bursts to test graph fault tolerance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onProceedToStep4}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/20 transition cursor-pointer"
          >
            <span>Proceed to Step 4: 3D Optimizer</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* QUICK ACTIONS & FAULT INJECTION CONTROLS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Auto-Connect Button */}
        <button
          onClick={handleAutoConnect}
          className="group p-4 rounded-xl bg-gradient-to-r from-cyan-900/50 to-blue-900/50 hover:from-cyan-800/60 hover:to-blue-800/60 border border-cyan-500/40 flex items-center justify-between text-left transition shadow-lg cursor-pointer"
        >
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>⚡ Auto-Connect Network</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1">
              Creates redundant multi-path mesh automatically.
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Clear All Faults */}
        <button
          onClick={handleClearAllFaults}
          className="p-4 rounded-xl bg-slate-900 hover:bg-slate-800/80 border border-slate-700/80 flex items-center justify-between text-left transition text-slate-200 cursor-pointer"
        >
          <div>
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
              <RotateCcw className="w-4 h-4" />
              <span>Reset All Pipes Clean</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Sets 100% flow efficiency on all lines.
            </p>
          </div>
        </button>

        {/* Test Fault Scenario */}
        <button
          onClick={handleInjectFaultScenario}
          className="p-4 rounded-xl bg-slate-900 hover:bg-slate-800/80 border border-amber-500/30 flex items-center justify-between text-left transition text-slate-200 cursor-pointer"
        >
          <div>
            <div className="flex items-center gap-2 font-bold text-sm text-amber-400">
              <ShieldAlert className="w-4 h-4" />
              <span>Inject Fault Scenario</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Inserts 1 leak, 1 silt clog & 1 burst pipe.
            </p>
          </div>
        </button>

        {/* Global Pipeline Pricing */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Pipe Price per Meter:</span>
            <span className="font-bold text-cyan-400">${pipePricePerMeter}/m</span>
          </div>
          <input
            type="range"
            min="5"
            max="40"
            value={pipePricePerMeter}
            onChange={(e) => setPipePricePerMeter(Number(e.target.value))}
            className="w-full accent-cyan-500 mt-2 cursor-pointer"
          />
        </div>

      </div>

      {/* NETWORK AGGREGATE STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400">Total Piping Distance</span>
          <div className="text-xl font-bold text-white mt-1">{networkMetrics.totalDist.toLocaleString()} m</div>
          <span className="text-[10px] text-slate-500">3D GPS & Slope Adjusted</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400">Total Pipeline Valuation</span>
          <div className="text-xl font-bold text-cyan-400 mt-1">${networkMetrics.totalCost.toLocaleString()}</div>
          <span className="text-[10px] text-slate-500">Includes loss penalties</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400">Active Pipelines</span>
          <div className="text-xl font-bold text-emerald-400 mt-1">
            {networkMetrics.totalCount - networkMetrics.blockedCount} / {networkMetrics.totalCount}
          </div>
          <span className="text-[10px] text-slate-500">Operational segments</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400">Degraded / Faulted Segments</span>
          <div className="text-xl font-bold text-rose-400 mt-1">
            {networkMetrics.blockedCount + networkMetrics.leakCount + networkMetrics.siltCount}
          </div>
          <span className="text-[10px] text-slate-500">
            {networkMetrics.blockedCount} blocked, {networkMetrics.leakCount} leaks
          </span>
        </div>
      </div>

      {/* MANUAL PIPE CONNECTOR TOOL */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-lg">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-cyan-400" />
          <span>Manual Pipeline Connection Builder</span>
        </h3>

        <form onSubmit={handleAddManualEdge} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-xs text-slate-400 block mb-1">From Node:</label>
            <select
              value={manualFrom}
              onChange={(e) => setManualFrom(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="">Select origin...</option>
              {nodes.map(n => (
                <option key={n.id} value={n.id}>{n.id} — {n.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">To Node:</label>
            <select
              value={manualTo}
              onChange={(e) => setManualTo(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="">Select destination...</option>
              {nodes.map(n => (
                <option key={n.id} value={n.id}>{n.id} — {n.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Pipe Bore Diameter:</label>
            <select
              value={manualDiameter}
              onChange={(e) => setManualDiameter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value={110}>110 mm (Main High-Flow Trunk)</option>
              <option value={90}>90 mm (Secondary Distribution)</option>
              <option value={75}>75 mm (Lateral Field Line)</option>
              <option value={63}>63 mm (Drip Sub-main)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={!manualFrom || !manualTo || manualFrom === manualTo}
            className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Connect Pipeline</span>
          </button>
        </form>
      </div>

      {/* PIPELINE NETWORK LIST & INTERACTIVE CONDITION SELECTORS */}
      <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-white">All Configured Farm Pipelines ({edges.length})</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Change the physical condition of any pipeline below to observe how the graph routing engine reacts in Step 4.
            </p>
          </div>

          {/* Condition Legend */}
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">✅ Clean</span>
            <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">💧 Leakage (+35% cost)</span>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">🪨 Silt (2x time)</span>
            <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">📉 Low Pressure</span>
            <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">❌ Blocked (Broken)</span>
          </div>
        </div>

        {edges.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
            No pipelines connected yet. Click <strong>"⚡ Auto-Connect Farm Pipeline Network"</strong> above or add lines manually.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hydratedEdges.map(edge => {
              const cond = edge.conditionMeta;
              const isBlocked = edge.isBlocked;

              return (
                <div
                  key={edge.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isBlocked
                      ? 'bg-rose-950/20 border-rose-500/40 ring-1 ring-rose-500/30'
                      : edge.condition === 'leakage'
                      ? 'bg-sky-950/20 border-sky-500/40'
                      : edge.condition === 'silt'
                      ? 'bg-amber-950/20 border-amber-500/40'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Card Header: Node Connection & Delete */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-white font-mono font-bold text-xs">
                        {edge.from}
                      </span>
                      <span className="text-slate-500 text-xs">➔</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-white font-mono font-bold text-xs">
                        {edge.to}
                      </span>
                      <span className="text-[10px] text-slate-400">({edge.diameter || 90}mm)</span>
                    </div>

                    <button
                      onClick={() => handleDeleteEdge(edge.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Remove pipeline"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Physical Condition Dropdown */}
                  <div className="mt-3">
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Physical Pipe Condition:
                    </label>
                    <select
                      value={edge.condition}
                      onChange={(e) => handleUpdateCondition(edge.id, e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      {Object.values(PIPE_CONDITIONS).map(c => (
                        <option key={c.id} value={c.id}>
                          {c.icon} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Physics & Cost Stats */}
                  <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Distance:</span>
                      <span className="text-white font-bold">{edge.distance} m</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block">Slope Gradient:</span>
                      <span className={`font-semibold ${edge.slope < 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {edge.slope < 0 ? `${edge.slope}% (Downhill)` : `+${edge.slope}% (Uphill)`}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block">Flow Speed:</span>
                      <span className="text-cyan-300 font-semibold">
                        {isBlocked ? '0 m/s (Impassable)' : `${edge.effectiveSpeed} m/s`}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block">Estimated Cost:</span>
                      <span className={`font-bold ${isBlocked ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {isBlocked ? '∞ (Severed)' : `$${edge.totalCost.toLocaleString()}`}
                      </span>
                    </div>
                  </div>

                  {/* Status Note */}
                  <div className="mt-2 text-[10px] text-slate-400 italic">
                    {cond.description}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}
