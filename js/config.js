// ============================================================
// Elden Earth — configuration
// Edit these values to tune the game or enable Google sign-in.
// ============================================================
const CONFIG = {
  // Paste an OAuth 2.0 Web Client ID from https://console.cloud.google.com/apis/credentials
  // (Authorized JavaScript origin = your github.io URL) to enable "Sign in with Google".
  // Leave blank to only offer Guest (local storage) sign-in.
  GOOGLE_CLIENT_ID: "711924778312-k9fkaqr5fa95rl03m5i9mhr5agv4upeq.apps.googleusercontent.com",

  // --- Tile grid ---
  TILE_SIZE_METERS: 6.096,        // ~20 x 20 feet
  GRID_RENDER_MIN_ZOOM: 16,       // grid only draws once zoomed in this close
  GRID_RENDER_MAX_TILES: 1200,    // safety cap per redraw

  // --- Diamonds ---
  DIAMOND_SPAWN_RADIUS_METERS: 200,   // ~220 yards (Spreads them across neighborhood)
  DIAMOND_COLLECT_RADIUS_METERS: 50,  // ~55 yards (Reachable reach)
  DIAMOND_MAX_ACTIVE: 12,
  DIAMOND_SPAWN_CHECK_MS: 30000,      // Checks for 1 new diamond every 30 seconds
  DIAMOND_LIFETIME_MS: 540 * 1000,     // 540 seconds or 5 min

  // --- Diamond Extractor ---
  EXTRACTOR_MIN_TILES: 5,               // Requires 5+ connected plots
  EXTRACTOR_INTERVAL_MS: 8 * 3600 * 1000, // 1 diamond every 8 hours (28800000 ms)
  EXTRACTOR_MAX_STORED: 3,              // Stores up to 3 diamonds max
  EXTRACTOR_BUILD_COST_EB: 50,          // 50 EB to construct
  
  // --- Spin wheel --- (Includes 🚫 Miss Slices)
  WHEEL_SLICES: [
    { type: "diamond", label: "+1 ◆", color: "#8fa3b8", weight: 110 },
    { type: "eb", amount: 1,  label: "1 EB",  color: "#4fd6c4", weight: 240 },
    { type: "miss",    label: "🚫",   color: "#3f2832", weight: 80  }, // Miss / No reward
    { type: "eb", amount: 2,  label: "2 EB",  color: "#4f9dd6", weight: 130 },
    { type: "diamond", label: "+1 ◆", color: "#8fa3b8", weight: 110 },
    { type: "eb", amount: 5,  label: "5 EB",  color: "#a86ee0", weight: 50  },
    { type: "miss",    label: "🚫",   color: "#3f2832", weight: 80  }, // Miss / No reward
    { type: "eb", amount: 25, label: "25 EB", color: "#e0a84f", weight: 15  },
    { type: "diamond", label: "+1 ◆", color: "#8fa3b8", weight: 110 },
    { type: "eb", amount: 50, label: "50 EB", color: "#d4af61", weight: 5   },
  ],
  SPIN_COST_DIAMONDS: 1,

  // --- Land plots (Exact Rates & Odds) ---
  PLOT_COST_EB: 100,
  PLOT_RARITIES: [
    { key: "common",    label: "Common",    rate: 0.0000000011, weight: 50, color: "#8fa3b8" }, // 50%
    { key: "rare",      label: "Rare",      rate: 0.000000016,  weight: 30, color: "#4f9dd6" }, // 30%
    { key: "epic",      label: "Epic",      rate: 0.000000022,  weight: 15, color: "#a86ee0" }, // 15%
    { key: "legendary", label: "Legendary", rate: 0.000000044,  weight: 5,  color: "#e0a84f" }, // 5%
  ],
};
