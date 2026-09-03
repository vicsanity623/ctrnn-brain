// ============================================================
// Elden Earth — save data
// One flat JSON blob in localStorage. Simple, portable, and
// easy to export/import by hand if a player wants to.
// ============================================================
const Store = (() => {
  const KEY = "eldenEarth.save.v1";

  function defaultState() {
    return {
      player: { name: "Traveler", id: null, avatar: "🙂" },
      cash: 0,            // Simulated passive USD cash balance
      eb: 150,            // Elden Bucks (game currency to buy plots/spins)
      diamonds: 0,
      plots: {},          // tileId -> { tx, ty, rarity, rate }
      liveDiamonds: {},   // diamondId -> { lat, lon, spawnedAt }
      boostExpiry: 0,     // Timestamp when multiplier ends
      boostMultiplier: 30,// 30 or 50
      extractor: { built: false, lastHarvest: Date.now(), stored: 0 },
      lastTick: Date.now(),
      createdAt: Date.now(),
    };
  }

  let state = null;

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      state = raw ? Object.assign(defaultState(), JSON.parse(raw)) : defaultState();
    } catch (e) {
      console.warn("Save data unreadable, starting fresh.", e);
      state = defaultState();
    }
    return state;
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("Could not save game.", e);
    }
  }

  function get() { return state; }

  function reset() {
    localStorage.removeItem(KEY);
    state = defaultState();
    save();
    return state;
  }

  // Total $/sec across every owned plot (multiplied if boost active)
  function totalRate() {
    let baseRate = 0;
    for (const id in state.plots) {
      const p = state.plots[id];
      const rarityKey = p.rarity?.key || p.rarity;
      const configRarity = CONFIG.PLOT_RARITIES.find(r => r.key === rarityKey);
      baseRate += (configRarity ? configRarity.rate : (p.rate || 0));
    }
    const isBoosted = state.boostExpiry && Date.now() < state.boostExpiry;
    return isBoosted ? baseRate * (state.boostMultiplier || 30) : baseRate;
  }

  // Apply whatever income accrued while the tab/app was closed
  function applyOfflineProgress() {
    const now = Date.now();
    const elapsedSec = Math.max(0, (now - (state.lastTick || now)) / 1000);
    const earned = elapsedSec * totalRate();
    if (state.cash === undefined) state.cash = 0;
    state.cash += earned;

    // Offline Diamond Extractor progress
    if (state.extractor && state.extractor.built) {
      const interval = CONFIG.EXTRACTOR_INTERVAL_MS || 28800000;
      const maxStored = CONFIG.EXTRACTOR_MAX_STORED || 3;
      const timeSince = now - state.extractor.lastHarvest;
      const newDiamonds = Math.floor(timeSince / interval);
      if (newDiamonds > 0) {
        state.extractor.stored = Math.min(maxStored, (state.extractor.stored || 0) + newDiamonds);
        state.extractor.lastHarvest = now - (timeSince % interval);
      }
    }

    state.lastTick = now;
    save();
    return earned;
  }

  return { load, save, get, reset, totalRate, applyOfflineProgress };
})();
