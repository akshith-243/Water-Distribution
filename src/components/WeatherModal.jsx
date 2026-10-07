import React from 'react';
import { X, CloudRain, Wind, Droplets, Thermometer, Sun, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

export default function WeatherModal({ isOpen, onClose, weatherData, onRefresh, farmLocationName }) {
  if (!isOpen || !weatherData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-900/60 via-cyan-900/40 to-slate-900 p-6 border-b border-slate-700/60 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl filter drop-shadow">{weatherData.wmo?.icon || '🌤️'}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white tracking-tight">Live Farmland Weather Sync</h3>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  Open-Meteo Live
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Location: <span className="text-cyan-300 font-medium">{farmLocationName || `${weatherData.lat.toFixed(3)}°N, ${weatherData.lng.toFixed(3)}°E`}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Rain Today Indicator (Crucial user requirement) */}
          <div className={`p-4 rounded-xl border flex items-center gap-4 ${
            weatherData.willRainToday
              ? 'bg-blue-950/60 border-blue-500/50 text-blue-200'
              : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
          }`}>
            <div className={`p-3 rounded-xl ${weatherData.willRainToday ? 'bg-blue-600/30 text-blue-300' : 'bg-amber-600/30 text-amber-300'}`}>
              <CloudRain className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider opacity-80">Today's Rain Forecast</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-black/30">
                  Max Chance: {weatherData.rainProbMax}%
                </span>
              </div>
              <div className="text-lg font-bold mt-0.5">
                {weatherData.willRainToday
                  ? `🌧️ Yes, Rain is Likely Today (${weatherData.rainProbMax}% Probability)`
                  : `☀️ No Rain Expected Today (${weatherData.rainProbMax}% Chance)`}
              </div>
              <p className="text-xs mt-1 text-slate-300">
                {weatherData.willRainToday
                  ? 'Precipitation detected or high probability. Soil moisture will increase naturally.'
                  : 'Arid / dry weather pattern. High crop transpiration rate requiring scheduled irrigation.'}
              </p>
            </div>
          </div>

          {/* Core Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-800/70 border border-slate-700/60 p-4 rounded-xl flex flex-col items-center text-center">
              <Thermometer className="w-5 h-5 text-rose-400 mb-1" />
              <span className="text-xs text-slate-400 font-medium">Temperature</span>
              <span className="text-2xl font-bold text-white mt-1">{weatherData.temp}°C</span>
              <span className="text-[11px] text-slate-500 mt-0.5">Ambient air</span>
            </div>

            <div className="bg-slate-800/70 border border-slate-700/60 p-4 rounded-xl flex flex-col items-center text-center">
              <Droplets className="w-5 h-5 text-cyan-400 mb-1" />
              <span className="text-xs text-slate-400 font-medium">Relative Humidity</span>
              <span className="text-2xl font-bold text-cyan-300 mt-1">{weatherData.humidity}%</span>
              <span className="text-[11px] text-slate-500 mt-0.5">Vapor saturation</span>
            </div>

            <div className="bg-slate-800/70 border border-slate-700/60 p-4 rounded-xl flex flex-col items-center text-center">
              <Wind className="w-5 h-5 text-emerald-400 mb-1" />
              <span className="text-xs text-slate-400 font-medium">Wind Velocity</span>
              <span className="text-2xl font-bold text-emerald-300 mt-1">{weatherData.windSpeed} km/h</span>
              <span className="text-[11px] text-slate-500 mt-0.5">At 10m height</span>
            </div>
          </div>

          {/* 6-Hour Rain Probability Timeline */}
          {weatherData.hourlyForecast && weatherData.hourlyForecast.length > 0 && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                <span>Next 6 Hours Precipitation Trend</span>
                <span className="text-[11px] text-cyan-400">Rain Probability %</span>
              </h4>
              <div className="grid grid-cols-6 gap-2 text-center">
                {weatherData.hourlyForecast.map((hour, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <span className="text-xs text-slate-400">{hour.time}</span>
                    <div className="w-full bg-slate-900 rounded-full h-16 my-1.5 flex items-end justify-center p-1">
                      <div
                        className={`w-full rounded-full transition-all duration-500 ${
                          hour.prob >= 50
                            ? 'bg-blue-500'
                            : hour.prob >= 25
                            ? 'bg-cyan-500/80'
                            : 'bg-slate-700'
                        }`}
                        style={{ height: `${Math.max(12, hour.prob)}%` }}
                      />
                    </div>
                    <span className={`text-xs font-bold ${hour.prob >= 40 ? 'text-blue-300' : 'text-slate-400'}`}>
                      {hour.prob}%
                    </span>
                    <span className="text-[10px] text-slate-500">{hour.temp}°</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Smart Agricultural Advisory */}
          <div className="bg-cyan-950/30 border border-cyan-800/40 rounded-xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1 flex items-center gap-2">
              <span>🌾 Irrigation Agronomist Advisory</span>
            </h4>
            <p className="text-sm text-slate-200 leading-relaxed">
              {weatherData.advisory}
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-950/80 px-6 py-3.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Synced automatically with farm coordinates</span>
          </div>

          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition text-xs font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Live Data</span>
          </button>
        </div>

      </div>
    </div>
  );
}
