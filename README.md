# 🌍 Elden Earth (2026 Edition)

A real-world geo-location territory-claiming and idle income game. Walk the real world, collect diamonds, spin the fortune wheel for Elden Bucks (EB), claim real 10×10 ft tiles beneath your feet, and earn simulated passive rent ($USD) every fraction of a second.

Built with **pure static HTML5 / CSS3 / Vanilla JS** — zero build step, no backend server required, and 100% hosted for free on GitHub Pages as a full **Progressive Web App (PWA)**.

---

## ✨ Implemented Core Features & Mechanics

* [x] **🗺️ 512px HD Mapbox Retina Graphics:** High-definition dark-themed vector tiles with crisp street grids and building footprints up to Zoom 22.
* [x] **💎 3D Hovering Gemstones & Particle FX:** Isometric 3D faceted crystal with specular lighting, real-time ground shadows, ambient rising stardust, and a 10-point particle explosion on collection.
* [x] **📡 Sonar Radar Collection Radius:** Real-time animated shockwaves continuously pulse outward from the player dot across an expanded collection radius.
* [x] **💵 Dual-Currency Economy:**
  * **Cash Balance ($USD):** High-precision simulated rent (15 decimal places) generated in real-time by your owned plots every 0.5 seconds with dual-scale typography and suppressed leading zeros under $1.00.
  * **Elden Bucks (EB):** Game currency used to claim new plots (100 EB) or construct base structures.
* [x] **⚡ 30X / 50X Income Multiplier:** Stackable 1-hour booster (up to 6 hours max bank) that electrifies the UI with animated gold pulses and speeds up real-time rent generation. Alternate days feature a rare **0.05% chance for a 50X Super Multiplier**.
* [x] **💎 Automated Diamond Extractor:** Unlockable beacon for players owning **5+ connected plots** that automatically mines 1 Diamond every 2 minutes (holds up to 50 gems). Upgradable with Cash Balance to expand capacity and reduce mining time.
* [x] **🎡 Weighted Diamond Spin Wheel:** Realistic physics-based spin wheel with weighted odds, jackpot prizes (25 EB & 50 EB), diamond refunds, and **`🚫` (Miss)** bust slices with background failsafe recovery.
* [x] **👤 Clustered Player Profile & Info Modal:** Google avatar sync that groups adjacent owned tiles into clean territories with centralized badges and an interactive Player Stats modal.
* [x] **📱 Progressive Web App (PWA):** Installable directly to iOS & Android home screens with offline asset caching via `sw.js`.

---

## 🎨 Visual & Sensory Roadmap

* [x] **Phase 1: 3D Diamond Overhaul & Particle Burst FX** *(Completed)*
  * 3D isometric faceted crystal with specular lighting & ground shadow.
  * Idle floating/hover bobbing animation with rising ambient stardust.
  * Mini particle explosion burst that shatters outward when collected.
* [ ] **Phase 2: 3D Isometric Plots & Territory Visuals** *(In Progress)*
  * 3D raised elevation borders on claimed plots with rarity glow edges.
  * Extractor 3D crystal beacon with rotating energy rings.
* [ ] **Phase 3: HUD Micro-Interactions & Flying Coins**
  * Floating `+1 ◆` and `+EB` combat-text popups rising from tap points.
  * Flying diamond particles traveling from the ground into your top HUD counter.
* [ ] **Phase 4: Sound FX & Mobile Haptics**
  * Subtle sound chimes for diamond collection, wheel clicks, and land claims.
  * Haptic vibration feedback on iOS & Android.

---

## 📁 Repository Structure

```text
├── index.html          # Main application structure, modals, and HUD
├── manifest.json       # PWA app configuration & home screen icons
├── sw.js               # Service Worker for local asset caching & offline play
├── css/
│   └── style.css       # Dark fantasy theme, animations, radar pulses & glowing borders
└── js/
    ├── config.js       # Central tuning file (rates, drop weights, radiuses, timers)
    ├── geo.js          # Web Mercator math, tile bounds, and Haversine distance calculations
    ├── storage.js      # LocalStorage save engine, offline progress, and dynamic rate lookups
    ├── auth.js         # Google Identity Services OAuth & instant guest auto-login
    ├── diamonds.js     # Spawn engine, expiration timer, and tap-to-collect logic
    ├── grid.js         # 10x10ft tile rendering, flood-fill territory clustering & buy modal
    ├── wheel.js        # Canvas-rendered 10-slice wheel with weighted RNG & failsafe timer
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

## 🔑 Optional: Enable Google Sign-In

By default, the game offers instant on-device Guest mode with persistent saves. To enable **Sign in with Google**:

1. Open the [Google Cloud Console Credentials Page](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth 2.0 Client ID** (Application type: *Web application*).
3. Under **Authorized JavaScript origins**, add your GitHub Pages origin (e.g., `https://yourusername.github.io`).
4. Copy your Client ID into `js/config.js`:
   ```javascript
   GOOGLE_CLIENT_ID: "your-id-here.apps.googleusercontent.com",
   ```
5. Commit and push. The Google Sign-In button will appear automatically on the welcome screen.

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

## 🗺️ Gameplay Feature Roadmap

* [ ] **1. 👑 Local Mayorship & Territory Dividends:** Player with the most plots in a city becomes Mayor, earns a commission on local tile sales, and displays their crown atop the city.
* [ ] **2. 📅 300-Day Daily Login Calendar:** Scaling login streak rewards giving daily EB up to a Day 300 Jackpot (200 EB).
* [ ] **3. ⚡ 50X "Blood Moon" Weekend Flash Events:** Time-limited global events where the multiplier jumps to 50X for 24 hours.
* [ ] **4. 🎁 Mystery Map Chests:** Rare Bronze, Silver, and Golden chests appearing on the map requiring diamond keys to open.
* [ ] **5. 🏰 3D Plot Landmarks & Upgrades:** Customizable visual monuments (Castles, Neon Shrines, Towers) providing local parcel income boosts.
* [ ] **6. 🛂 Passport Stamps & Explorer Badges:** Collectible badges for traveling to new cities that award permanent account-wide +5% rent multipliers.
* [ ] **7. 📜 Daily Quests & Weekly Bounties:** Engaging rotation of tasks (e.g., *Collect 3 diamonds*, *Spin 2 times*) for bonus EB.
* [ ] **8. 🔥 Multiplayer Firestore Sync:** Real-time WebSocket synchronization across players to see claimed lands live worldwide without refreshing.
* [ ] **9. 🛡️ Realm Guilds & Joint Kingdoms:** Alliance territories pooling diamonds into a communal Guild Vault to trigger kingdom-wide buffs.
* [ ] **10. 🔊 Sensory Juice, SFX & Mobile Haptics:** Tactile vibrations and audio fanfares on diamond collection, wheel spins, and land claims.

---

## 📄 License & Disclaimer

This is a personal, open-source fan implementation of real-world grid collection games. Built from scratch with pure web standards for educational and entertainment purposes.
