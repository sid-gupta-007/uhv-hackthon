# RakshaNet (रक्षामित्र) — Emergency Resource Coordination & Trust Platform

> **UHV Hackathon MVP Prototype**  
> *An AI-assisted emergency resource coordination & trust platform that pools government, private, and volunteer emergency resources across India's fragmented landscape.*

---

## 🌟 The Core Innovation: Beyond Dispatch-Ranking Apps

In India, emergency medical response is severely fragmented across siloed systems:
- Government ambulances (**108 / 112 / ERSS**)
- Private hospital networks (**Apollo, Manipal, Fortis**)
- Volunteer responder squads (**Indian Red Cross, St. John Ambulance, Community First Aid**)

RakshaNet is **not another route-optimization app**. It is the missing **trust and accountability layer** that:
1. **Spatially organizes cities and districts into Hexagonal Sectors (H3-style)** with dynamic traffic-aware neighbor backup coverage.
2. **Fuses multi-channel data** (Citizen PWA SOS, 112 calls, smart city CCTV beacons, crowd SMS) using confidence-weighted tiers instead of trusting a single noisy report.
3. **Hardcodes an Inviolable Life-Safety & Equity Veto (UHV Floor)**: No optimization algorithm may ever downrank or deprioritize a human being based on economic status, ID/Aadhaar credentials, or sector "efficiency".
4. **Maintains a Tamper-Evident Append-Only Decision Ledger** hash-chained with SHA-256 for independent civil society / oversight audits.
5. **Reaches into Zero-Connectivity Zones** via 4 resilient communication tiers (4G/5G $\rightarrow$ LoRa Mesh $\rightarrow$ Vehicle Sneakernet $\rightarrow$ Direct Satellite Ping) and offline-first IndexedDB PWA caching.

---

## 🚀 Key Features Built in this Prototype

### 1. Citizen SOS PWA (Offline-First)
- **1-Tap Emergency Trigger**: Giant, accessible touch target with a 3-second abort buffer to eliminate false alarms.
- **Low-Literacy & Icon-First Design**: Intuitive visual cards for Cardiac, Crash, Maternal, Trauma, Fire, and Disaster.
- **Multilingual Support**: English, हिन्दी (Hindi), ಕನ್ನಡ (Kannada), and বাংলা (Bengali).
- **True Offline-First Reach**: Built with Service Worker caching and **IndexedDB** queueing.
  - *Demo Flow*: Switch to **"Simulate Airplane Mode (Offline)"**, submit an SOS, observe it safely queued on the device, toggle back **"Online"**, and watch the background synchronization fire instantly into Central Command!
- **4-Tier Connectivity Simulator**: Visually demonstrates packet hop degradation across:
  1. *Tier 1: Full 4G/5G Network (Direct Cloud Link)*
  2. *Tier 2: LoRa Mesh 868 MHz (2-Hop Community Relay)*
  3. *Tier 3: Vehicle Sneakernet (BMTC Transit Bus Delay-Tolerant Beacon)*
  4. *Tier 4: Satellite Direct Ping (ISRO NavIC Byte Burst)*
- **Dignity-Preserving Status**: Reassuring, human-centric messaging (*"Help is on the way — ETA ~6 mins"*) paired with instant category-specific first aid guidance.

### 2. Dispatcher HQ Dashboard
- **Interactive Hexagon-Sector Spatial Mesh**: Visualizes sector capacity, fleet density, and **dynamic cross-sector backup coverage** (e.g., when Sector H1's primary ALS unit is engaged, Sector H2's unit automatically illuminates as backup).
- **Ranked Live Incident Queue**: Multi-channel confidence fusion indicators with explainable AI reasoning (*"Why This Rank?"*).
- **Human-In-The-Loop Authorization**: 1-click Approve, Reassign across pooled fleets (Govt 108, Apollo ALS, Red Cross Bike, Garuda Medic Drone).
- **Mandatory Reason Override Modal**: Enforces a strict reason code requirement before any override is submitted. **No silent overrides are permitted.**

### 3. Priority Scoring & Confidence Fusion Engine
- **Multi-Signal Weighting**: Base clinical severity (0–45) + Multi-channel corroboration (0–30) + Proximity (0–25).
- **Tiered Verification**:
  - *Tier 1 (Single uncorroborated report)*: Proportional low-cost verification (Drone recon / nearby bike volunteer / IVR callback).
  - *Tier 2 (2+ independent signals)*: Immediate full ALS ambulance dispatch.
  - *Tier 3 (Mass casualty / CCTV anomaly)*: Multi-agency surge protocol.
- **Universal Human Value (UHV) Hard Veto**: Hardcoded logic guarantees that clinical distress cannot fall below a priority score of 75, regardless of whether the patient is in a remote rural road or an informal settlement.

### 4. Tamper-Evident SHA-256 Decision Ledger & Audit Screen
- **Cryptographic Hash Chain**: Every AI recommendation and human action is signed with previous block hash, actor ID, and payload signature.
- **Independent Oversight View**: Strictly read-only for judicial or public oversight bodies.
- **Interactive Verification**:
  - Click **"Verify Chain Integrity"** to mathematically re-evaluate every block SHA-256 hash.
  - Click **"Simulate Tamper"** to test retroactive tampering detection (instantly flags the corrupted block in red).

### 5. Public Equity & Sector Transparency Portal
- Aggregated response times across Urban Core, Peri-Urban, and Rural sectors.
- Framed explicitly to expose infrastructure deficits for municipal ambulance depot funding, rather than blaming frontline personnel.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technologies Used |
|---|---|
| **Frontend UI** | React 19, TypeScript, Tailwind CSS v4, Lucide Icons |
| **Offline Persistence** | IndexedDB via Dexie.js, Service Worker Cache & Background Sync |
| **Spatial Layer** | Custom Flat-Topped Hexagon Axial Coordinate Mesh Layer |
| **Cryptography** | Web Crypto API SHA-256 Hash Chaining & Block Signing |
| **Audio Feedback** | Web Audio API Synthesizer (Zero asset dependency) |
| **Animations** | Tailwind CSS Transitions, Canvas Confetti, Radar Rings |

---

## 🏃 Getting Started & Running Locally

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation & Run
```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🎬 Suggested Hackathon Demo Flow for Judges

1. **Test Offline-First Citizen SOS**:
   - Open **Citizen SOS View**.
   - Click the top badge **"Network Online"** to switch to **"Simulated Offline (Airplane Mode)"**.
   - Select **Heart / Chest Pain**, tap the giant red **SOS button**, let the 3s buffer complete.
   - Show the judge that the SOS is stored securely in IndexedDB with status: *"Saved securely on device — will auto-relay instantly upon signal"*.
   - Click **"Simulate Airplane Mode"** again to reconnect $\rightarrow$ watch the sync notification chime and see the incident appear live in the Dispatcher Queue!

2. **Explore 4 Connectivity Tiers**:
   - Click between **4G/5G**, **LoRa Mesh**, **Vehicle Sneakernet**, and **Satellite Ping** to show how RakshaNet adapts its packet route across zero-signal Indian geographies.

3. **Demonstrate Dispatcher Hex Grid & Dynamic Backup**:
   - Switch to **Dispatcher HQ**.
   - Point out Sector H1 (Indiranagar) where the primary unit is busy and the glowing yellow dashed line shows **Sector H2 (Koramangala) automatically stepping up as backup coverage**.

4. **Demonstrate Mandatory Human Override**:
   - Expand an incident in the ranked queue.
   - Click **"Override with Reason"**.
   - Attempt to submit without a reason code $\rightarrow$ show that the UI strictly blocks silent overrides.
   - Select a reason code (e.g. *Heavy Traffic Congestion*), enter notes, and submit.

5. **Demonstrate Cryptographic Audit & Tamper Detection**:
   - Switch to the **Decision Ledger** tab.
   - Click **"Verify Chain Integrity"** $\rightarrow$ show green 100% verified status and celebratory confetti.
   - Click **"Simulate Tamper"** $\rightarrow$ show how the cryptographic hash mismatch is caught and highlighted in red immediately.
   - Click **"Reset"** to restore valid state.

---

## 📜 Ethical Charter & Universal Human Values (UHV)

1. **Inviolable Human Dignity**: Every life has equal intrinsic worth. Algorithms must never assign priority based on wealth, insurance tier, or social status.
2. **Human-in-the-Loop Supremacy**: Artificial intelligence assists with multi-signal confidence fusion; authorized human personnel always retain final authorization.
3. **Public Transparency**: System data is used to hold institutions accountable for infrastructure equity, protecting workers from unfair punitive metrics.
