# Route Optimization for Water Distribution: A Graph-Based Approach for Efficient Water Route Planning

An interactive, high-performance web application engineered to solve real-world agricultural water conveyance challenges using computer science graph algorithms, hydrological terrain physics, real-time weather synchronization, and interactive 3D WebGL visualization.

---

## 🌟 Key Features & Architecture

### 1. Persistent Top Header with Real-Time Weather Sync
- **Branding & Title:** "Route Optimization for Water Distribution: A Graph-Based Approach for Efficient Water Route Planning".
- **4-Step Clean Wizard Navigation:**
  - `1. Home & How It Works`
  - `2. Map & Multi-Field Pinning`
  - `3. Pipeline Network & Conditions`
  - `4. 3D Multi-Field Route Optimizer & Smart Suggestions`
- **Live Weather Widget:**
  - Synchronized in real time with the free **Open-Meteo Weather API** based on the current farmland coordinates.
  - Live Temperature (°C), Relative Humidity (%), Wind Velocity, and an explicit **Rain Probability & "Rain Today / No Rain" Indicator**.
  - Clicking the badge opens an interactive 24-hour precipitation forecast modal with tailored agronomist irrigation advisories.

---

### 2. Section 1: Home & How It Works (Interactive Intro)
- **Hero Section:** Explains the platform's core mission: efficiently distributing water from Water Sources through a Pipeline Network to **multiple agricultural fields simultaneously**.
- **Two Direct Action Buttons:**
  - `Start Mapping Your Farm ➔`: Navigates to Step 2 for custom parcel placement.
  - `Load Pre-Built Demo Farm Network`: Automatically loads a realistic 6-node network (1 reservoir, 5 crop fields with varying terrain elevations and pipe faults) and navigates straight to Step 4 with complete calculations.
- **4-Card Visual Workflow:** Explaining the 4-phase optimization pipeline with interactive hover feedback.
- **Graph Theory & CS Mapping:**
  - **Vertices ($V$):** Water Sources ($S_1, S_2$) and Crop Fields ($F_1, F_2, F_3...$).
  - **Edges ($E$):** Pipelines connecting parcels with physical diameters and materials.
  - **Weights ($W$):** Multi-attribute weights combining 3D GPS distance, hydraulic slope gravity assistance/resistance, pipe friction, and fault cost penalties.
- **Algorithm Comparison:**
  - **BFS ($O(V + E)$):** Level-by-level shortest hop exploration & reachability verification under pipeline failure.
  - **DFS (Exhaustive):** Exhaustive path enumeration to find all redundant backup circuits and calculate reliability scores.
  - **Dijkstra's Algorithm ($O(E + V \log V)$):** Finding mathematically optimal paths under Distance, Cost, or Time objectives.
  - **Steiner / Union Distribution Tree:** Delivering water to **all selected fields at the same time** without duplicate piping.
- **Interactive Graph Sandbox:** Test real-time rerouting directly on the Home page by clicking pipelines to cycle faults (Clean ➔ Leakage 💧 ➔ Silt 🪨 ➔ Blocked ❌).

---

### 3. Section 2: Map & Multi-Field Pinning (Satellite Map + Auto Land Data)
- **High-Resolution Satellite Map:** Powered by Leaflet with ESRI World Imagery tiles (with toggleable Topographic and Street/Road layers).
- **Click-to-Pin Mode:** Toggle between pinning Water Reservoirs ($S_1, S_2...$) or Agricultural Fields ($F_1, F_2, F_3...$).
- **Crop Types & Water Priorities:**
  1. `🌾 Paddy / Rice`: Critical Priority (~1,200 mm demand).
  2. `🌱 Cotton / Sugarcane`: High Priority (~850 mm demand).
  3. `🍅 Vegetables / Drip Crops`: Medium Priority (~450 mm demand).
  4. `🌽 Millet / Pulses`: Standard Priority (~300 mm demand).
- **Soil Types & Retention:** Black Cotton Soil (very high retention), Red Sandy Loam (fast draining), Alluvial Clay (optimal buffer).
- **Automated Geo-Telemetry on Pin:** Every map click automatically fetches:
  - Exact GPS Latitude & Longitude.
  - Real Land Elevation (meters above sea level).
  - Slope Gradient relative to Water Source ($S_1$).
  - Soil Moisture (%) baseline.
- **Preset Farmland Locations:** Punjab Agricultural Basin, California Central Valley, Krishna-Godavari Delta, and Nile Delta.

---

### 4. Section 3: Pipeline Network & Real-World Flow Conditions
- **Auto-Connect Network:** `⚡ Auto-Connect Farm Pipeline Network` button automatically constructs a Delaunay / nearest-neighbor loop mesh with redundant bypass paths.
- **Manual Pipeline Builder:** Connect any two parcels with chosen pipe bore diameter (63mm to 110mm).
- **Distance, Pricing & Slope Hydraulics:**
  - 3D GPS distance calculated with elevation variation.
  - Interactive Pipe Price per meter slider ($5/m to $40/m).
  - Flow speed automatically adjusted by hydraulic slope: downhill gravity increases speed (up to +45%), uphill slows flow down.
- **Physical Flow Conditions per Pipe:**
  1. `✅ Normal Clean Pipe`: 100% efficiency, 0% water loss.
  2. `💧 Pipe Leakage`: 35% water loss penalty, pressure drop, cost penalty.
  3. `🪨 Dust / Silt Stuck`: 50% flow speed reduction, doubles travel time.
  4. `📉 Reduced Flow / Low Pressure`: 40% travel time delay.
  5. `❌ Blocked / Burst Pipeline`: Pipe severed, tests failover rerouting.

---

### 5. Section 4: 3D Multi-Field Route Optimizer & Smart Advisory
- **Multi-Field Simultaneous Irrigation:** Farmer can select all fields or pick any multi-parcel subset ($F_1, F_2, F_3...$).
- **Optimization Criteria:** Choose between Lowest Cost, Shortest Distance, Fastest Delivery Time, or Balanced AI Score.
- **View 1 — Master Multi-Field Distribution Plan:**
  - Joint Union Distribution Tree supplying all selected fields simultaneously.
  - Master KPIs: Total Distinct Pipe Length, Distribution Valuation Cost, Peak Delivery Time, Daily Water Demand (kL), Average Water Loss Rate (%), and Pump Power Head (kW).
  - Path breakdown table per field.
  - **Chronological Valve Operation Schedule:** Step-by-step valve turn-on instructions ordered by agronomic urgency (Paddy fields with low soil moisture are opened first).
- **View 2 — All Possible Route Outcomes (DFS Enumeration):**
  - Side-by-side comparison matrix of all discovered alternative pathways to any selected field.
  - Path sequence, hop count, distance, time, cost, reliability score, and bottlenecks.
- **3D WebGL Interactive Farmland Simulation (Three.js):**
  - 3D terrain with real elevation relief and grid overlay.
  - 3D Elevated Water Tower with glowing beacon.
  - 3D Agricultural plots with crop-specific foliage models.
  - 3D Connected pipelines with **animated flowing water particles**!
  - Orbit controls, Top-Down view toggle, and Elevation Exaggeration slider (0.5x to 4x).
- **Smart Agronomic Advisory:**
  - Live weather recommendations based on rain probability.
  - Soil retention & drainage advice.
  - Urgent hydraulic repair alerts calculating financial savings.
  - Export full irrigation plan to JSON.

---

## 🚀 Running Locally

The application uses standard modern web tools and works immediately out of the box with zero configuration or paid API keys:

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Open in your browser
http://127.0.0.1:5173/
```

To create an optimized production build:
```bash
npm run build
npm run preview
```

---

## 🛠️ Technology Stack
- **Framework:** React 19 + Vite 8
- **Styling & UI:** Tailwind CSS v4, Lucide React Icons
- **Mapping:** Leaflet with high-resolution ESRI World Imagery satellite tiles
- **3D Graphics:** Three.js (WebGL interactive terrain, water tower, pipelines & particle animation)
- **Live APIs:** Open-Meteo Weather & Elevation APIs (100% Free, No API key needed)
