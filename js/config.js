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
  DIAMOND_SPAWN_RADIUS_METERS: 160.35, // 200 yards
  DIAMOND_COLLECT_RADIUS_METERS: 36.576, // 20 yards
  DIAMOND_MAX_ACTIVE: 18,
  DIAMOND_SPAWN_CHECK_MS: 20000,   // how often we consider spawning a new one
  DIAMOND_LIFETIME_MS: 30 * 60 * 1000, // diamonds expire & respawn elsewhere after this long

  // --- Spin wheel --- (10 equal-odds slices, 1 diamond per spin)
  WHEEL_SLICES: [
    { type: "diamond", label: "+1 ◆", color: "#8fa3b8" },
    { type: "eb", amount: 1,  label: "1 EB",  color: "#4fd6c4" },
    { type: "diamond", label: "+1 ◆", color: "#8fa3b8" },
    { type: "eb", amount: 2,  label: "2 EB",  color: "#4f9dd6" },
    { type: "diamond", label: "+1 ◆", color: "#8fa3b8" },
    { type: "eb", amount: 5,  label: "5 EB",  color: "#a86ee0" },
    { type: "diamond", label: "+1 ◆", color: "#8fa3b8" },
    { type: "eb", amount: 25, label: "25 EB", color: "#e0a84f" },
    { type: "diamond", label: "+1 ◆", color: "#8fa3b8" },
    { type: "eb", amount: 50, label: "50 EB", color: "#d4af61" },
  ],
  SPIN_COST_DIAMONDS: 1,

  // --- Land plots ---
  PLOT_COST_EB: 100,
  PLOT_RARITIES: [
    { key: "common",    label: "Common",    rate: 0.0000023, weight: 60, color: "#8fa3b8" },
    { key: "rare",      label: "Rare",      rate: 0.0000027, weight: 25, color: "#4f9dd6" },
    { key: "epic",      label: "Epic",      rate: 0.0000035, weight: 10, color: "#a86ee0" },
    { key: "legendary", label: "Legendary", rate: 0.0000059, weight: 5,  color: "#e0a84f" },
  ],
};
