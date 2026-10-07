import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, Eye, Maximize2, Play, Pause, Layers } from 'lucide-react';
import { CROP_TYPES } from '../constants';

export default function FarmVisualizer3D({ 
  nodes, 
  edges, 
  activeEdges = [],
  highlightedPath = [] 
}) {
  const mountRef = useRef(null);
  const [elevationScale, setElevationScale] = useState(2.0); // Exaggerate elevation for visual clarity
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isTopView, setIsTopView] = useState(false);

  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const waterParticlesGroupRef = useRef(null);
  const dynamicObjectsGroupRef = useRef(null);

  // Mouse drag orbit controls state
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({ theta: Math.PI / 4, phi: Math.PI / 3, radius: 180 });

  // Map coordinate conversion to local 3D scene units
  // Find bounding box of nodes
  const coordsRef = useRef({ minLat: 0, maxLat: 0, minLng: 0, maxLng: 0, centerLat: 0, centerLng: 0 });

  useEffect(() => {
    if (!mountRef.current || nodes.length === 0) return;

    const width = mountRef.current.clientWidth || 800;
    const height = mountRef.current.clientHeight || 500;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);
    scene.fog = new THREE.FogExp2(0x0a0f1d, 0.0025);
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 2000);
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x67e8f9, 1.2);
    dirLight.position.set(100, 200, 100);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const softFillLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    softFillLight.position.set(-100, 80, -100);
    scene.add(softFillLight);

    // Dynamic objects container
    const dynamicGroup = new THREE.Group();
    scene.add(dynamicGroup);
    dynamicObjectsGroupRef.current = dynamicGroup;

    // Water particles container
    const particlesGroup = new THREE.Group();
    scene.add(particlesGroup);
    waterParticlesGroupRef.current = particlesGroup;

    // Build the 3D Farm Environment
    rebuild3DWorld();

    // Resize listener
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 5. Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Auto-rotation if enabled
      if (isAutoRotating && !isDraggingRef.current) {
        cameraAngleRef.current.theta += 0.005;
        updateCameraPosition();
      }

      // Animate flowing water particles along active pipelines
      if (particlesGroup) {
        particlesGroup.children.forEach(particle => {
          if (particle.userData && particle.userData.animate) {
            particle.userData.animate(elapsedTime);
          }
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Update camera position helper
  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { theta, phi, radius } = cameraAngleRef.current;
    cameraRef.current.position.x = radius * Math.sin(phi) * Math.sin(theta);
    cameraRef.current.position.y = radius * Math.cos(phi);
    cameraRef.current.position.z = radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.lookAt(0, 5, 0);
  };

  // Rebuild 3D objects when nodes, edges, or elevationScale changes
  useEffect(() => {
    rebuild3DWorld();
  }, [nodes, edges, activeEdges, elevationScale]);

  // Transform GPS (lat, lng, elev) into local 3D coordinates (x, y, z)
  const get3DPos = (node, scale = elevationScale) => {
    if (nodes.length === 0) return new THREE.Vector3(0, 0, 0);

    const lats = nodes.map(n => n.lat);
    const lngs = nodes.map(n => n.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;

    const latSpan = Math.max(0.001, maxLat - minLat);
    const lngSpan = Math.max(0.001, maxLng - minLng);

    // Map to a 140 x 140 unit 3D plane
    const x = ((node.lng - centerLng) / lngSpan) * 110;
    const z = -((node.lat - centerLat) / latSpan) * 110;

    // Baseline elevation offset
    const baseElev = Math.min(...nodes.map(n => n.elevation || 200));
    const y = ((node.elevation || baseElev) - baseElev) * scale * 2.5 + 4;

    return new THREE.Vector3(x, y, z);
  };

  const rebuild3DWorld = () => {
    if (!dynamicObjectsGroupRef.current || !waterParticlesGroupRef.current) return;

    const group = dynamicObjectsGroupRef.current;
    const particlesGroup = waterParticlesGroupRef.current;

    // Clear old meshes
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }
    while (particlesGroup.children.length > 0) {
      particlesGroup.remove(particlesGroup.children[0]);
    }

    if (nodes.length === 0) return;

    // 1. Create Farmland Terrain Grid & Base Floor
    const terrainGeo = new THREE.PlaneGeometry(220, 220, 24, 24);
    terrainGeo.rotateX(-Math.PI / 2);

    // Apply gentle topographic height variation to terrain vertices
    const posAttr = terrainGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vz = posAttr.getZ(i);
      // Small undulating terrain waves
      const vy = Math.sin(vx * 0.04) * 2 + Math.cos(vz * 0.04) * 1.5 - 3;
      posAttr.setY(i, vy);
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x131f33,
      roughness: 0.9,
      metalness: 0.1,
      wireframe: false
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.receiveShadow = true;
    group.add(terrainMesh);

    // Grid helper overlay
    const gridHelper = new THREE.GridHelper(220, 22, 0x1e3a5f, 0x172554);
    gridHelper.position.y = -2.8;
    group.add(gridHelper);

    // 2. Build 3D Nodes
    const nodePositions = new Map();
    nodes.forEach(node => {
      const pos = get3DPos(node);
      nodePositions.set(node.id, pos);

      if (node.type === 'source') {
        // --- 3D ELEVATED WATER TOWER / RESERVOIR ---
        const towerGroup = new THREE.Group();
        towerGroup.position.copy(pos);

        // Tower legs
        const legGeo = new THREE.CylinderGeometry(0.5, 0.5, 12, 8);
        const legMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7 });
        for (let i = 0; i < 4; i++) {
          const leg = new THREE.Mesh(legGeo, legMat);
          const angle = (i * Math.PI) / 2;
          leg.position.set(Math.cos(angle) * 3.5, 6, Math.sin(angle) * 3.5);
          towerGroup.add(leg);
        }

        // Water tank body
        const tankGeo = new THREE.CylinderGeometry(5.5, 5.5, 9, 24);
        const tankMat = new THREE.MeshStandardMaterial({
          color: 0x0284c7,
          metalness: 0.8,
          roughness: 0.2
        });
        const tank = new THREE.Mesh(tankGeo, tankMat);
        tank.position.y = 15;
        towerGroup.add(tank);

        // Water beacon glow
        const beaconGeo = new THREE.SphereGeometry(1.2, 16, 16);
        const beaconMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const beacon = new THREE.Mesh(beaconGeo, beaconMat);
        beacon.position.y = 20.5;
        towerGroup.add(beacon);

        // Foundation pad
        const padGeo = new THREE.CylinderGeometry(6, 6, 1, 24);
        const padMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
        const pad = new THREE.Mesh(padGeo, padMat);
        pad.position.y = 0.5;
        towerGroup.add(pad);

        group.add(towerGroup);

      } else {
        // --- 3D AGRICULTURAL FIELD PLOT ---
        const fieldGroup = new THREE.Group();
        fieldGroup.position.copy(pos);

        const crop = CROP_TYPES[node.cropType] || CROP_TYPES.paddy;
        const cropColor = new THREE.Color(crop.color || '#10b981');

        // Field Base Platform
        const plotGeo = new THREE.BoxGeometry(11, 1.5, 11);
        const plotMat = new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          roughness: 0.8
        });
        const plotMesh = new THREE.Mesh(plotGeo, plotMat);
        plotMesh.position.y = 0.75;
        fieldGroup.add(plotMesh);

        // Field Soil Layer with Crop Color Border
        const soilGeo = new THREE.BoxGeometry(9.5, 0.4, 9.5);
        const soilMat = new THREE.MeshStandardMaterial({
          color: cropColor,
          roughness: 0.5,
          metalness: 0.2
        });
        const soilMesh = new THREE.Mesh(soilGeo, soilMat);
        soilMesh.position.y = 1.6;
        fieldGroup.add(soilMesh);

        // Crop Plants representation (cluster of small stalks)
        const plantGeo = new THREE.ConeGeometry(0.6, 2.5, 6);
        const plantMat = new THREE.MeshStandardMaterial({ color: cropColor });
        for (let r = -3; r <= 3; r += 2) {
          for (let c = -3; c <= 3; c += 2) {
            const plant = new THREE.Mesh(plantGeo, plantMat);
            plant.position.set(r + (Math.random() - 0.5) * 0.4, 3, c + (Math.random() - 0.5) * 0.4);
            fieldGroup.add(plant);
          }
        }

        // Elevated Pin Marker
        const markerGeo = new THREE.SphereGeometry(1.6, 16, 16);
        const markerMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: cropColor,
          emissiveIntensity: 0.4
        });
        const marker = new THREE.Mesh(markerGeo, markerMat);
        marker.position.y = 6.5;
        fieldGroup.add(marker);

        group.add(fieldGroup);
      }
    });

    // 3. Build 3D Connected Pipelines (Edges)
    edges.forEach(edge => {
      const p1 = nodePositions.get(edge.from);
      const p2 = nodePositions.get(edge.to);
      if (!p1 || !p2) return;

      const isEdgeActive = activeEdges.some(
        ae => (ae.from === edge.from && ae.to === edge.to) || (ae.from === edge.to && ae.to === edge.from)
      );
      const isBlocked = edge.condition === 'blocked';
      const isLeaking = edge.condition === 'leakage';
      const isSilt = edge.condition === 'silt';

      // Pipe Curve / Line from p1 to p2
      const start = p1.clone().add(new THREE.Vector3(0, 1.5, 0));
      const end = p2.clone().add(new THREE.Vector3(0, 1.5, 0));

      const distance = start.distanceTo(end);
      const direction = new THREE.Vector3().subVectors(end, start);
      const orientation = new THREE.Matrix4();

      // Pipe Radius: larger for main trunks
      const pipeRadius = isEdgeActive ? 0.9 : 0.5;

      const pipeGeo = new THREE.CylinderGeometry(pipeRadius, pipeRadius, distance, 12);
      pipeGeo.translate(0, distance / 2, 0);
      pipeGeo.rotateX(Math.PI / 2);

      let pipeColor = 0x334155;
      let emissiveColor = 0x000000;
      let emissiveIntensity = 0;

      if (isBlocked) {
        pipeColor = 0xef4444;
        emissiveColor = 0xef4444;
        emissiveIntensity = 0.5;
      } else if (isEdgeActive) {
        pipeColor = 0x06b6d4; // bright cyan
        emissiveColor = 0x0891b2;
        emissiveIntensity = 0.8;
      } else if (isLeaking) {
        pipeColor = 0x38bdf8;
      } else if (isSilt) {
        pipeColor = 0xf59e0b;
      }

      const pipeMat = new THREE.MeshStandardMaterial({
        color: pipeColor,
        emissive: emissiveColor,
        emissiveIntensity,
        roughness: 0.3,
        metalness: 0.6
      });

      const pipeMesh = new THREE.Mesh(pipeGeo, pipeMat);
      pipeMesh.position.copy(start);
      pipeMesh.lookAt(end);
      group.add(pipeMesh);

      // 4. ANIMATED FLOWING WATER PARTICLES FOR ACTIVE PIPELINES
      if (isEdgeActive && !isBlocked) {
        const particleCount = Math.max(4, Math.floor(distance / 12));
        for (let i = 0; i < particleCount; i++) {
          const pGeo = new THREE.SphereGeometry(0.85, 8, 8);
          const pMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9 });
          const particle = new THREE.Mesh(pGeo, pMat);

          const offsetPhase = i / particleCount;

          particle.userData = {
            animate: (time) => {
              // Water particle moves along pipeline vector
              const flowSpeed = isSilt ? 0.25 : 0.55;
              const progress = (time * flowSpeed + offsetPhase) % 1.0;
              particle.position.lerpVectors(start, end, progress);
            }
          };

          particlesGroup.add(particle);
        }
      }

      // 5. BLOCKED PIPE HAZARD RING
      if (isBlocked) {
        const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        const ringGeo = new THREE.TorusGeometry(2.5, 0.4, 8, 16);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.copy(midPoint);
        group.add(ring);
      }
    });
  };

  // Mouse Orbit Event Handlers
  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - prevMousePosRef.current.x;
    const deltaY = e.clientY - prevMousePosRef.current.y;

    cameraAngleRef.current.theta -= deltaX * 0.008;
    cameraAngleRef.current.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, cameraAngleRef.current.phi - deltaY * 0.008));

    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    updateCameraPosition();
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    cameraAngleRef.current.radius = Math.max(60, Math.min(350, cameraAngleRef.current.radius + e.deltaY * 0.15));
    updateCameraPosition();
  };

  // Reset Camera View
  const handleResetCamera = () => {
    cameraAngleRef.current = { theta: Math.PI / 4, phi: Math.PI / 3, radius: 180 };
    setIsTopView(false);
    updateCameraPosition();
  };

  // Toggle Top-Down View
  const handleToggleTopView = () => {
    if (!isTopView) {
      cameraAngleRef.current = { theta: 0, phi: 0.1, radius: 190 };
      setIsTopView(true);
    } else {
      cameraAngleRef.current = { theta: Math.PI / 4, phi: Math.PI / 3, radius: 180 };
      setIsTopView(false);
    }
    updateCameraPosition();
  };

  return (
    <div className="relative w-full h-[540px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 select-none">
      
      {/* Three.js Canvas Container */}
      <div
        ref={mountRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Floating 3D Controls Bar */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-slate-700/80 shadow-lg text-xs">
        
        {/* Reset Camera */}
        <button
          onClick={handleResetCamera}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition font-medium cursor-pointer"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Reset View</span>
        </button>

        {/* Top-Down Toggle */}
        <button
          onClick={handleToggleTopView}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition font-medium cursor-pointer ${
            isTopView
              ? 'bg-cyan-600 border-cyan-500 text-white'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{isTopView ? '3D Angled' : 'Top Down'}</span>
        </button>

        {/* Auto-Rotate */}
        <button
          onClick={() => setIsAutoRotating(!isAutoRotating)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition font-medium cursor-pointer ${
            isAutoRotating
              ? 'bg-cyan-600 border-cyan-500 text-white'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
          }`}
        >
          {isAutoRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isAutoRotating ? 'Pause Orbit' : 'Auto Orbit'}</span>
        </button>

        {/* Elevation Exaggeration Slider */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-700 text-slate-300">
          <span className="text-[11px] font-medium">Elevation Relief:</span>
          <input
            type="range"
            min="0.5"
            max="4.0"
            step="0.5"
            value={elevationScale}
            onChange={(e) => setElevationScale(Number(e.target.value))}
            className="w-20 accent-cyan-500 cursor-pointer"
          />
          <span className="text-[11px] font-mono font-bold text-cyan-400">{elevationScale}x</span>
        </div>

      </div>

      {/* Floating 3D Legend & Interaction Hint */}
      <div className="absolute bottom-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/80 shadow-lg text-[11px] text-slate-300 flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-blue-500 shadow-sm" />
          <span>Elevated Water Tower (S1)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-500 shadow-sm" />
          <span>Agricultural Plots (F)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-1 bg-cyan-400 rounded-full" />
          <span>Active Flowing Pipe</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-1 bg-rose-500 rounded-full" />
          <span>Blocked Line</span>
        </span>
      </div>

      <div className="absolute bottom-4 right-4 z-10 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-400">
        🖱️ Click & Drag to Orbit • Scroll to Zoom
      </div>

    </div>
  );
}
