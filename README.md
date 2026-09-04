# 🌍 Elden Earth

A real-world geo-location territory-claiming and idle income game. Walk the real world, collect diamonds, spin the fortune wheel for Elden Bucks (EB), claim real 10×10 ft tiles beneath your feet, and earn simulated passive rent ($USD) every fraction of a second.

Built with **pure static HTML5 / CSS3 / Vanilla JS** — zero build step, no backend server required, and 100% hosted for free on GitHub Pages as a full **Progressive Web App (PWA)**.

---

## ✨ Implemented Core Features & Mechanics

* [x] **🎮 3D WebGL Engine & 60° Isometric Camera:** Mapbox GL JS 3D vector engine with 60° isometric camera tilt, free 360° touch orbit gestures, and true 3D extruded city buildings.
* [x] **🧭 True North Navigation & Compass Reset:** Dedicated compass button that smoothly animates camera bearing back to True North (0°) and restores default 18.5 zoom.
* [x] **📐 "Buy Land" Cinematic 2D Mode:** One-tap button that smoothly flies the camera from 60° 3D down to a flat 2D top-down view (`pitch: 0`), reveals the 10×10 ft grid strictly within reach, and allows precise land claims without building occlusions.
* [x] **🧍 3D Animated Mixamo Characters (Three.js WebGL):** Integrated Three.js custom layer rendering upright, hero-scaled 3D character models (`.glb`) at real-time GPS coordinates with automatic `Idle` $\leftrightarrow$ `Walk` speed-based animation blending.
* [x] **👗 3D Wardrobe & Character Selector:** In-game wardrobe modal accessible via a gold **✏️ Pencil** on the Player Info profile card, allowing players to hot-swap between multiple 3D models (`Soldier`, `Xbot`, `Fox`, `CesiumMan`, `Custom`).
* [x] **🔥 Real-time Multiplayer Firestore Sync:** Live WebSocket streaming across all players worldwide to see newly claimed lands, plot rarities, and avatars in real time without refreshing.
* [x] **☁️ Firebase Cloud Saves & Recovery:** Permanent account backups stored in Google Cloud Firestore. Reinstalling the app or logging in on a new device instantly restores all EB, cash, diamonds, boost time, and territories.
* [x] **⏳ Sequential Boot Pipeline:** Dedicated `js/loading.js` bootloader with an animated gold/teal progress bar and terminal logs that pre-fetches world plots and coordinates with zero race conditions.
* [x] **📱 Forced Portrait Guard:** Orientation guard overlay preventing unintended screen rotation on mobile devices.
* [x] **💎 3D Hovering Gemstones & Particle FX:** Upright 3D faceted crystals with specular lighting, real-time ground shadows, organic desynchronized hover physics, ambient rising stardust, and a 10-point particle explosion on collection.
* [x] **🖥️ HUD Micro-Interactions & Flying 3D Gems:** Floating `+1 ◆` and `+EB` combat-text popups rising from tap points, accompanied by physical flying 3D crystals traveling from the street into the top HUD counter with impact bumps.
* [x] **🏰 3D Raised Parcels & Orbital Extractor:** Elevation bevels and neon rarity glow edges on claimed plots flush with the ground, plus a 3D levitating Extractor Beacon with counter-rotating orbital energy rings.
* [x] **📡 Sonar Radar Collection Radius:** Real-time animated shockwaves continuously pulse outward from the player dot across an expanded collection radius that dynamically locks to real-world meters across all zoom levels.
* [x] **💵 Dual-Currency Economy:**
  * **Cash Balance ($USD):** High-precision simulated rent (15 decimal places) generated in real-time by your owned plots every 0.5 seconds with dual-scale typography and suppressed leading zeros under $1.00.
  * **Elden Bucks (EB):** Game currency used to claim new plots (100 EB) or construct base structures.
* [x] **⚡ 30X / 50X Income Multiplier:** Stackable 1-hour booster (up to 6 hours max bank) that electrifies the UI with animated gold pulses and speeds up real-time rent generation. Alternate days feature a rare **0.05% chance for a 50X Super Multiplier**.
* [x] **💎 Automated Diamond Extractor:** Unlockable beacon for players owning **5+ connected plots** (Limit 1 per player) that automatically mines 1 Diamond every 2 minutes (holds up to 50 gems). Upgradable with Cash Balance to expand capacity and reduce mining time.
* [x] **🎡 Weighted Diamond Spin Wheel:** Realistic physics-based spin wheel with weighted odds, jackpot prizes (25 EB & 50 EB), 3D canvas gems, diamond refunds, and **`🚫` (Miss)** bust slices with background failsafe recovery.
* [x] **👤 Clustered Player Profile & Info Modal:** Google avatar sync that groups adjacent owned tiles into clean territories with centralized badges and an interactive Player Stats modal (supports inspecting other players' live cash earnings).
* [x] **📱 Progressive Web App (PWA):** Installable directly to iOS & Android home screens with network-first offline asset caching via `sw.js`.

---

## 🎨 Visual & Sensory Roadmap

* [x] **Phase 1: 3D Diamond Overhaul & Particle Burst FX** *(Completed)*
* [x] **Phase 2: 3D Isometric Plots & Territory Visuals** *(Completed)*
* [x] **Phase 3: HUD Micro-Interactions & Flying Coins** *(Completed)*
* [x] **Phase 5: 3D WebGL Camera, Isometric Buildings & Mixamo 3D Character** *(Completed)*
* [ ] **Phase 4: Sound FX & Mobile Haptics** *(Next Phase)*
  * Subtle sound chimes for diamond collection, wheel clicks, and land claims.
  * Haptic vibration feedback on iOS & Android.
* [ ] **Phase 6: 🌐 Community Globe Tab** *(Upcoming Feature)*
  * Dedicated interactive 3D Earth Globe viewing mode.
  * Free worldwide camera controls to spin the planet, inspect global territories, and zoom into international player empires without leaving your home base.

---

## 📁 Repository Structure

```text
├── index.html          # Main application structure, modals, HUD & portrait guard
├── manifest.json       # PWA app configuration & home screen icons
├── sw.js               # Service Worker for local asset caching & offline play
├── css/
│   └── style.css       # Dark fantasy theme, animations, radar pulses & glowing borders
├── models/             # 3D GLTF / GLB Skeletal Character Models
│   ├── Soldier.glb     # Vanguard Soldier (Idle, Walk, Run)
│   ├── Xbot.glb        # X-Operative Android (Mixamo Rig)
│   ├── Fox.glb         # Low-Poly Spirit Fox (Survey, Walk)
│   ├── CesiumMan.glb   # Cesium Tracksuit Walker
│   └── character.glb   # Custom Champion
└── js/
    ├── config.js       # Central tuning file (rates, drop weights, radiuses, Firebase keys)
    ├── geo.js          # Web Mercator math, tile bounds, and Haversine distance calculations
    ├── storage.js      # Save engine, Firestore cloud sync, offline progress & rate lookups
    ├── auth.js         # Google Identity Services OAuth & cloud save retrieval
    ├── loading.js      # Bootloader pipeline, progress bar & zero-race condition loader
    ├── character.js    # Three.js WebGL custom layer & GPS animation controller
    ├── diamonds.js     # Spawn engine, expiration timer, and 3D crystal particle FX
    ├── grid.js         # 10x10ft tile rendering, flood-fill clustering & multiplayer sync
    ├── wheel.js        # Canvas-rendered 10-slice wheel with 3D gems & failsafe timer
    └── main.js         # Game loop, 500ms ticker, booster countdowns, and UI wiring
```

---

## 🚀 How to Host on GitHub Pages

1. **Create a GitHub repository** (public or private) and upload all project files preserving the folder structure.
2. In your repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to `Deploy from a branch`, choose `main` (or default branch), and select folder `/ (root)`.
4. Click **Save**. GitHub Pages will deploy your game at `https://yourusername.github.io/your-repo/`.
5. Open the link on your phone. Tap **Share → Add to Home Screen** on iOS or **Install App** on Android to play in full-screen standalone mode.

---

## 🔑 Optional: Enable Google Sign-In & Firebase Cloud Saves

By default, the game offers instant on-device Guest mode with persistent saves. To enable **Google Sign-In & Firebase Cloud Saves**:

1. Open the [Google Cloud Console Credentials Page](https://console.cloud.google.com/apis/credentials) and create an **OAuth 2.0 Client ID** (Authorized origin: `https://yourusername.github.io`).
2. Copy your Client ID into `js/config.js`:
   ```javascript
   GOOGLE_CLIENT_ID: "your-id-here.apps.googleusercontent.com",
   ```
3. Create a free project at [firebase.google.com](https://firebase.google.com), enable **Firestore Database**, and paste your config keys into `js/config.js`:
   ```javascript
   FIREBASE_CONFIG: {
     apiKey: "YOUR_API_KEY",
     authDomain: "your-app.firebaseapp.com",
     projectId: "your-app",
     // ...
   }
   ```
4. Commit and push. Your game will now auto-save progress to the cloud and sync multiplayer territories live worldwide!

---

## ⚙️ Game Balance & Plot Rarities

All gameplay tuning parameters are centralized in **`js/config.js`**:

| Rarity | Drop Chance | Rent per Second | Color |
| :--- | :---: | :---: | :---: |
| **Common** | **50%** | `$0.0000000011/s` | Slate Grey (`#8fa3b8`) |
| **Rare** | **30%** | `$0.0000000160/s` | Cyan Blue (`#4f9dd6`) |
| **Epic** | **15%** | `$0.0000000220/s` | Royal Purple (`#a86ee0`) |
| **Legendary** | **5%** | `$0.0000000440/s` | Radiant Gold (`#e0a84f`) |

---

## 📄 License & Disclaimer

This is a personal, open-source fan implementation of real-world grid collection games. Built from scratch with pure web standards for educational and entertainment purposes. For Shits and Giggles.
