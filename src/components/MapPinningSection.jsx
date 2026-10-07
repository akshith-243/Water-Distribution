import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Droplet, 
  Plus, 
  Trash2, 
  Compass, 
  Layers, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  Check, 
  Edit3, 
  LocateFixed, 
  Info,
  Mountain,
  Gauge
} from 'lucide-react';
import { CROP_TYPES, SOIL_TYPES, PRESET_FARMS } from '../constants';
import { fetchLandElevation } from '../utils/weatherApi';

export default function MapPinningSection({ 
  nodes, 
  setNodes, 
  onProceedToStep3,
  mapCenter,
  setMapCenter
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  // Pin mode: 'field' | 'source' | 'inspect'
  const [pinMode, setPinMode] = useState('field');
  const [selectedCrop, setSelectedCrop] = useState('paddy');
  const [selectedSoil, setSelectedSoil] = useState('black_cotton');
  const [tileLayerType, setTileLayerType] = useState('satellite'); // 'satellite' | 'topo' | 'osm'
  const [activeEditingNode, setActiveEditingNode] = useState(null);
  const [isFetchingElevation, setIsFetchingElevation] = useState(false);

  // Reference to source elevation for slope calculations
  const sourceNode = nodes.find(n => n.type === 'source');

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    const initialCenter = mapCenter || [30.9015, 75.8560];
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 16,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Default: ESRI Satellite Imagery (High-res, free, no API key required)
    const esriSatellite = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri, Earthstar Geographics',
        maxZoom: 19
      }
    );

    esriSatellite.addTo(map);
    mapInstanceRef.current = map;
    markersLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Switch Tile Basemap Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing tile layers
    map.eachLayer(layer => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    if (tileLayerType === 'satellite') {
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { attribution: 'Tiles &copy; Esri', maxZoom: 19 }
      ).addTo(map);
    } else if (tileLayerType === 'topo') {
      L.tileLayer(
        'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        { attribution: 'Map data: &copy; OpenTopoMap', maxZoom: 17 }
      ).addTo(map);
    } else {
      L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { attribution: '&copy; OpenStreetMap contributors', maxZoom: 19 }
      ).addTo(map);
    }
  }, [tileLayerType]);

  // Handle Map Click to Pin Nodes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = async (e) => {
      const { lat, lng } = e.latlng;
      setIsFetchingElevation(true);

      // Auto-fetch real land elevation from GPS coords
      const elevation = await fetchLandElevation(lat, lng);
      setIsFetchingElevation(false);

      if (pinMode === 'source') {
        // Create new Water Source
        const sourceCount = nodes.filter(n => n.type === 'source').length + 1;
        const newSource = {
          id: `S${sourceCount}`,
          type: 'source',
          name: `Water Reservoir S${sourceCount}`,
          lat: Number(lat.toFixed(5)),
          lng: Number(lng.toFixed(5)),
          elevation,
          sourceCapacity: 60000,
          sourceType: 'Elevated Tank & Solar Pump'
        };
        setNodes(prev => [...prev, newSource]);
      } else if (pinMode === 'field') {
        // Create new Agricultural Field
        const fieldCount = nodes.filter(n => n.type === 'field').length + 1;
        const crop = CROP_TYPES[selectedCrop];
        const soil = SOIL_TYPES[selectedSoil];

        // Compute terrain slope relative to water source
        let slope = 0;
        if (sourceNode) {
          const elevDiff = elevation - sourceNode.elevation;
          slope = Number(elevDiff.toFixed(1));
        }

        const newField = {
          id: `F${fieldCount}`,
          type: 'field',
          name: `Field ${fieldCount}: ${crop.name}`,
          lat: Number(lat.toFixed(5)),
          lng: Number(lng.toFixed(5)),
          elevation,
          cropType: selectedCrop,
          soilType: selectedSoil,
          soilMoisture: soil.moistureBase + Math.floor(Math.random() * 6 - 3),
          areaAcre: 2.5,
          slope
        };
        setNodes(prev => [...prev, newField]);
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [pinMode, selectedCrop, selectedSoil, nodes, sourceNode]);

  // Render Custom Markers on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    nodes.forEach(node => {
      const isSource = node.type === 'source';
      const crop = !isSource ? CROP_TYPES[node.cropType] : null;

      // Custom HTML Marker Icon
      const markerHtml = isSource
        ? `
          <div class="relative flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 border-2 border-white shadow-xl shadow-blue-500/50 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform">
            <span class="text-white text-xs font-black">${node.id}</span>
            <div class="absolute -bottom-6 px-1.5 py-0.5 rounded bg-slate-900/95 border border-cyan-500/40 text-[10px] text-cyan-300 font-bold whitespace-nowrap shadow-md">
              ⛰️ Elev: ${node.elevation}m
            </div>
          </div>
        `
        : `
          <div class="relative flex items-center justify-center w-9 h-9 rounded-full bg-slate-900 border-2 shadow-xl transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform" style="border-color: ${crop?.color || '#10b981'}">
            <span class="text-xs font-black text-white">${node.id}</span>
            <div class="absolute -bottom-6 px-1.5 py-0.5 rounded bg-slate-900/95 border border-slate-700 text-[10px] text-slate-200 font-medium whitespace-nowrap shadow-md">
              ${crop?.icon || '🌾'} Elev: ${node.elevation}m
            </div>
          </div>
        `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: markerHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = L.marker([node.lat, node.lng], { icon: customIcon });

      // Interactive Popup
      const popupHtml = `
        <div class="p-2 space-y-1 text-slate-100 text-xs">
          <div class="font-bold text-sm text-cyan-300">${node.name} (${node.id})</div>
          <div><strong>Elevation:</strong> ${node.elevation} m above sea level</div>
          ${!isSource ? `
            <div><strong>Crop:</strong> ${crop?.name} (${crop?.priority} Priority)</div>
            <div><strong>Soil:</strong> ${SOIL_TYPES[node.soilType]?.name || node.soilType}</div>
            <div><strong>Moisture:</strong> ${node.soilMoisture}%</div>
            <div><strong>Slope to S1:</strong> ${node.elevation - (sourceNode?.elevation || node.elevation) > 0 ? '+' : ''}${(node.elevation - (sourceNode?.elevation || node.elevation))}m</div>
          ` : `
            <div><strong>Capacity:</strong> ${node.sourceCapacity?.toLocaleString()} L/h</div>
            <div><strong>Type:</strong> ${node.sourceType}</div>
          `}
          <div class="text-[10px] text-slate-400 font-mono mt-1">${node.lat.toFixed(4)}, ${node.lng.toFixed(4)}</div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      markersLayer.addLayer(marker);
    });
  }, [nodes, sourceNode]);

  // Fly to preset location
  const handleSelectPreset = (preset) => {
    setMapCenter(preset.coords);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(preset.coords, 16, { duration: 1.5 });
    }
  };

  // Delete node
  const handleDeleteNode = (nodeId) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
  };

  return (
    <div className="space-y-8 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-slate-100">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/40 px-2.5 py-0.5 rounded border border-cyan-800/40 mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Step 2: Geographical Pinning</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Satellite Farmland Map & Multi-Field Pinning
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Click anywhere on the satellite view to place your Water Source and multiple Agricultural Fields. Land elevation and slope are fetched automatically.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onProceedToStep3}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/20 transition cursor-pointer"
          >
            <span>Proceed to Step 3: Pipelines</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PRESET FARMS QUICK SELECTOR */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center gap-3 text-xs">
        <span className="text-slate-400 font-semibold flex items-center gap-1.5">
          <LocateFixed className="w-4 h-4 text-cyan-400" />
          <span>Preset Real Farmlands:</span>
        </span>
        {PRESET_FARMS.map((farm, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectPreset(farm)}
            className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 hover:border-cyan-500/50 text-slate-200 transition text-xs font-medium cursor-pointer"
          >
            {farm.name}
          </button>
        ))}
      </div>

      {/* MAIN MAP INTERFACE & CONTROL BAR */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* LEFT COLUMN: PINNING TOOLBAR & CROP SELECTOR */}
        <div className="lg:col-span-1 space-y-5">
          
          {/* Node Pin Mode Selector */}
          <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-lg space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Map Click Pin Mode</span>
              {isFetchingElevation && (
                <span className="text-[11px] text-cyan-400 animate-pulse">Fetching elevation...</span>
              )}
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPinMode('source')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-xs font-bold ${
                  pinMode === 'source'
                    ? 'bg-blue-600/30 border-blue-500 text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="p-2 rounded-full bg-blue-500 text-white mb-1.5">
                  <Droplet className="w-4 h-4" />
                </div>
                <span>💧 Water Source</span>
                <span className="text-[10px] font-normal text-slate-400 mt-0.5">(S1, S2...)</span>
              </button>

              <button
                onClick={() => setPinMode('field')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-xs font-bold ${
                  pinMode === 'field'
                    ? 'bg-emerald-600/30 border-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="p-2 rounded-full bg-emerald-500 text-white mb-1.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <span>🌾 Crop Field</span>
                <span className="text-[10px] font-normal text-slate-400 mt-0.5">(F1, F2...)</span>
              </button>
            </div>

            {/* Instruction Callout */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300 leading-normal">
              {pinMode === 'source' ? (
                <span>📍 Click anywhere on the map to place an <strong>Elevated Water Reservoir / Borewell (S)</strong>.</span>
              ) : (
                <span>📍 Click anywhere on the map to pin an <strong>Agricultural Field (F)</strong> with selected crop properties below.</span>
              )}
            </div>
          </div>

          {/* Field Properties Configuration (When Pinning Fields) */}
          {pinMode === 'field' && (
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-lg space-y-4 animate-fadeIn">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Crop & Soil Type For Next Pin
              </h3>

              {/* Crop Selection */}
              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-semibold block">Crop Type & Water Priority:</label>
                <div className="space-y-1.5">
                  {Object.values(CROP_TYPES).map(crop => (
                    <button
                      key={crop.id}
                      onClick={() => setSelectedCrop(crop.id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs text-left transition ${
                        selectedCrop === crop.id
                          ? 'bg-slate-800 border-cyan-500 text-white font-bold ring-1 ring-cyan-500/50'
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{crop.icon}</span>
                        <div>
                          <div>{crop.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{crop.demandLabel}</div>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${crop.bgLight}`}>
                        {crop.priority}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Soil Selection */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-xs text-slate-300 font-semibold block">Soil Type & Water Retention:</label>
                <select
                  value={selectedSoil}
                  onChange={(e) => setSelectedSoil(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {Object.values(SOIL_TYPES).map(soil => (
                    <option key={soil.id} value={soil.id}>
                      {soil.name} — {soil.waterRetention}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 italic">
                  {SOIL_TYPES[selectedSoil]?.advisory}
                </p>
              </div>

            </div>
          )}

          {/* Map Layer Switcher */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-lg space-y-2 text-xs">
            <span className="text-slate-400 font-semibold block">Basemap Layer:</span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => setTileLayerType('satellite')}
                className={`px-2 py-1.5 rounded-lg border font-medium text-center transition ${
                  tileLayerType === 'satellite'
                    ? 'bg-cyan-600 border-cyan-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                Satellite
              </button>
              <button
                onClick={() => setTileLayerType('topo')}
                className={`px-2 py-1.5 rounded-lg border font-medium text-center transition ${
                  tileLayerType === 'topo'
                    ? 'bg-cyan-600 border-cyan-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                Topographic
              </button>
              <button
                onClick={() => setTileLayerType('osm')}
                className={`px-2 py-1.5 rounded-lg border font-medium text-center transition ${
                  tileLayerType === 'osm'
                    ? 'bg-cyan-600 border-cyan-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                Street/Roads
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: INTERACTIVE SATELLITE MAP CONTAINER */}
        <div className="lg:col-span-3 space-y-4">
          
          <div className="relative w-full h-[540px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
            {/* The Leaflet Map Canvas */}
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* Floating Map Legend & Stats Overlay */}
            <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-700/80 shadow-lg text-xs space-y-1">
              <div className="font-bold text-white flex items-center gap-2">
                <span>Active Map Pins:</span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">
                  {nodes.length} Nodes
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-300">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>Sources: {nodes.filter(n => n.type === 'source').length}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Fields: {nodes.filter(n => n.type === 'field').length}</span>
                </span>
              </div>
            </div>

            {/* Quick Helper Badge */}
            <div className="absolute bottom-4 left-4 z-10 bg-slate-950/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-400">
              💡 Tip: Click any placed pin to view real elevation, soil, and slope telemetry.
            </div>
          </div>

        </div>

      </div>

      {/* PINNED NODES SUMMARY CARDS & TELEMETRY LIST */}
      <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Pinned Nodes & Real Geographical Telemetry</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Review elevation, slope compared to Water Source S1, and agricultural demands for each pinned parcel.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 px-3 py-1 rounded-lg border border-cyan-800/40">
            {nodes.length} Nodes Loaded
          </span>
        </div>

        {nodes.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
            No pins placed yet. Click on the satellite map above to place your water source and fields.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nodes.map(node => {
              const isSource = node.type === 'source';
              const crop = !isSource ? CROP_TYPES[node.cropType] : null;
              const soil = !isSource ? SOIL_TYPES[node.soilType] : null;
              const elevDiff = sourceNode ? node.elevation - sourceNode.elevation : 0;
              const isDownhill = elevDiff < 0;

              return (
                <div
                  key={node.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isSource
                      ? 'bg-blue-950/20 border-blue-500/40'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isSource ? 'bg-blue-600 text-white' : 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {node.id}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{node.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {node.lat.toFixed(4)}, {node.lng.toFixed(4)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteNode(node.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Remove node"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Attributes Details */}
                  <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Elevation:</span>
                      <span className="text-white font-bold flex items-center gap-1">
                        <Mountain className="w-3 h-3 text-cyan-400" />
                        {node.elevation} m MSL
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block">Slope vs S1:</span>
                      {isSource ? (
                        <span className="text-cyan-300 font-semibold">Origin Datum</span>
                      ) : (
                        <span className={`font-bold ${isDownhill ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {elevDiff > 0 ? `+${elevDiff}m (Uphill)` : `${elevDiff}m (Downhill)`}
                        </span>
                      )}
                    </div>

                    {!isSource && (
                      <>
                        <div>
                          <span className="text-slate-400 block">Crop Demand:</span>
                          <span className={`font-semibold ${crop?.color ? `text-[${crop.color}]` : 'text-slate-200'}`}>
                            {crop?.icon} {crop?.name.split('/')[0]} ({crop?.priority})
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 block">Soil Moisture:</span>
                          <span className="text-cyan-300 font-semibold">
                            {node.soilMoisture}% ({soil?.name.split(' ')[0]})
                          </span>
                        </div>
                      </>
                    )}
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
