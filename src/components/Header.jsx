import React from 'react';
import { Droplet, Compass, GitFork, Box, CloudRain, Sun, Cloud, RefreshCw, ChevronRight } from 'lucide-react';

export const STEPS = [
  { id: 1, key: 'home', label: '1. Home & How It Works', short: 'Overview', icon: Compass },
  { id: 2, key: 'pinning', label: '2. Map & Multi-Field Pinning', short: 'Map Pinning', icon: Compass },
  { id: 3, key: 'network', label: '3. Pipeline Network & Conditions', short: 'Pipes & Faults', icon: GitFork },
  { id: 4, key: 'optimizer', label: '4. 3D Multi-Field Route Optimizer & Smart Suggestions', short: '3D Optimizer', icon: Box }
];

export default function Header({ currentStep, onSelectStep, weatherData, onOpenWeatherModal, isWeatherLoading }) {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Left: Branding & Project Title */}
          <div 
            onClick={() => onSelectStep(1)} 
            className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-200">
              <Droplet className="w-6 h-6 text-white fill-white/80" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight group-hover:text-cyan-400 transition-colors">
                  Route Optimization for Water Distribution
                </h1>
                <span className="hidden xl:inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Graph AI
                </span>
              </div>
              <p className="text-xs text-slate-400 tracking-normal hidden md:block">
                A Graph-Based Approach for Efficient Water Route Planning
              </p>
            </div>
          </div>

          {/* Center: 4 Step Navigation Tabs (Spacious & Clean) */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80 shadow-inner">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => onSelectStep(step.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/25 ring-1 ring-cyan-400/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                  }`}
                  title={step.label}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {step.id}
                  </span>
                  <span className="hidden xl:inline">{step.label.replace(/^\d+\.\s*/, '')}</span>
                  <span className="inline xl:hidden">{step.short}</span>
                </button>
              );
            })}
          </nav>

          {/* Top-Right: Real-Time Weather Sync Widget */}
          <div className="flex items-center gap-2 shrink-0">
            {weatherData ? (
              <button
                onClick={onOpenWeatherModal}
                className="group flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 shadow-md transition-all text-left"
                title="Click to view detailed live farmland weather forecast and agricultural advisory"
              >
                {/* Weather Icon & Rain Status Badge */}
                <div className="relative">
                  <span className="text-2xl filter drop-shadow group-hover:scale-110 transition-transform">
                    {weatherData.wmo?.icon || '🌤️'}
                  </span>
                  {weatherData.willRainToday && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-slate-900 animate-ping" />
                  )}
                </div>

                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {weatherData.temp}°C
                    </span>
                    <span className="text-[11px] text-slate-400">
                      • {weatherData.humidity}% RH
                    </span>
                  </div>

                  {/* Will it rain today or not indicator */}
                  <div className="flex items-center gap-1">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                      weatherData.willRainToday ? 'bg-blue-400' : 'bg-amber-400'
                    }`} />
                    <span className={`text-[10px] font-semibold tracking-tight ${
                      weatherData.willRainToday ? 'text-blue-300' : 'text-amber-300'
                    }`}>
                      {weatherData.willRainToday
                        ? `Rain Today: ${weatherData.rainProbMax}%`
                        : `No Rain (${weatherData.rainProbMax}%)`}
                    </span>
                  </div>
                </div>

                <div className="hidden sm:block pl-1 text-slate-500 group-hover:text-cyan-400 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-400">
                <RefreshCw className={`w-3.5 h-3.5 ${isWeatherLoading ? 'animate-spin text-cyan-400' : ''}`} />
                <span>Syncing live weather...</span>
              </div>
            )}
          </div>

        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1 border-t border-slate-800/80 no-scrollbar">
          {STEPS.map((step) => {
            const isActive = currentStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => onSelectStep(step.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-cyan-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{step.id}.</span>
                <span>{step.short}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
