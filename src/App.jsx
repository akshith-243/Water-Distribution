import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import WeatherModal from './components/WeatherModal';
import HomeSection from './components/HomeSection';
import MapPinningSection from './components/MapPinningSection';
import PipelineSection from './components/PipelineSection';
import OptimizerSection from './components/OptimizerSection';
import { DEMO_FARM_DATA } from './constants';
import { fetchLiveWeatherData } from './utils/weatherApi';

export default function App() {
  // Navigation: Step 1 (Home), Step 2 (Map Pinning), Step 3 (Pipelines), Step 4 (Optimizer)
  const [currentStep, setCurrentStep] = useState(1);

  // Farmland Nodes & Edges State
  const [nodes, setNodes] = useState(() => DEMO_FARM_DATA.nodes);
  const [edges, setEdges] = useState(() => DEMO_FARM_DATA.edges);
  const [mapCenter, setMapCenter] = useState(() => DEMO_FARM_DATA.center);

  // Global Pipeline Configuration Parameters
  const [pipePricePerMeter, setPipePricePerMeter] = useState(12); // $ or ₹ per meter
  const [baseFlowSpeed, setBaseFlowSpeed] = useState(1.5); // 1.5 m/s

  // Weather Sync State
  const [weatherData, setWeatherData] = useState(null);
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);

  // Fetch Live Weather for Current Farm Location
  const loadWeather = useCallback(async (lat, lng) => {
    setIsWeatherLoading(true);
    const data = await fetchLiveWeatherData(lat, lng);
    setWeatherData(data);
    setIsWeatherLoading(false);
  }, []);

  // Initial Weather Sync
  useEffect(() => {
    loadWeather(mapCenter[0], mapCenter[1]);
  }, [loadWeather, mapCenter]);

  // Handler for "Start Mapping Your Farm" button
  const handleStartMapping = () => {
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler for "Load Pre-Built Demo Farm Network" button
  const handleLoadDemoFarm = () => {
    setNodes(DEMO_FARM_DATA.nodes);
    setEdges(DEMO_FARM_DATA.edges);
    setMapCenter(DEMO_FARM_DATA.center);
    setCurrentStep(4); // Jumps straight to Step 4 with complete simulation!
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* PERSISTENT TOP HEADER BAR */}
      <Header
        currentStep={currentStep}
        onSelectStep={(step) => {
          setCurrentStep(step);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        weatherData={weatherData}
        onOpenWeatherModal={() => setIsWeatherModalOpen(true)}
        isWeatherLoading={isWeatherLoading}
      />

      {/* DETAILED REAL-TIME WEATHER MODAL */}
      <WeatherModal
        isOpen={isWeatherModalOpen}
        onClose={() => setIsWeatherModalOpen(false)}
        weatherData={weatherData}
        onRefresh={() => loadWeather(mapCenter[0], mapCenter[1])}
        farmLocationName="Punjab Agro Basin (Satellite Farmland)"
      />

      {/* MAIN CONTENT AREA - 4-STEP WIZARD / MULTI-PAGE NAVIGATION */}
      <main className="flex-1 w-full pb-20">
        
        {/* Step 1: Home & How It Works */}
        {currentStep === 1 && (
          <HomeSection
            onStartMapping={handleStartMapping}
            onLoadDemoFarm={handleLoadDemoFarm}
            onNavigateStep={(step) => {
              setCurrentStep(step);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* Step 2: Map & Multi-Field Pinning */}
        {currentStep === 2 && (
          <MapPinningSection
            nodes={nodes}
            setNodes={setNodes}
            mapCenter={mapCenter}
            setMapCenter={setMapCenter}
            onProceedToStep3={() => {
              setCurrentStep(3);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* Step 3: Pipeline Network & Conditions */}
        {currentStep === 3 && (
          <PipelineSection
            nodes={nodes}
            edges={edges}
            setEdges={setEdges}
            pipePricePerMeter={pipePricePerMeter}
            setPipePricePerMeter={setPipePricePerMeter}
            baseFlowSpeed={baseFlowSpeed}
            setBaseFlowSpeed={setBaseFlowSpeed}
            onProceedToStep4={() => {
              setCurrentStep(4);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* Step 4: 3D Multi-Field Route Optimizer & Smart Suggestions */}
        {currentStep === 4 && (
          <OptimizerSection
            nodes={nodes}
            edges={edges}
            pipePricePerMeter={pipePricePerMeter}
            baseFlowSpeed={baseFlowSpeed}
            weatherData={weatherData}
            onNavigateStep={(step) => {
              setCurrentStep(step);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

      </main>

      {/* PERSISTENT FOOTER */}
      <footer className="w-full bg-slate-900/90 border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="font-semibold text-slate-400">Route Optimization for Water Distribution</span>
            <span>— A Graph-Based Approach for Efficient Water Route Planning</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Powered by Graph Theory (BFS, DFS, Dijkstra & Steiner Distribution Trees) & Real Satellite Hydrology
          </div>
        </div>
      </footer>

    </div>
  );
}
