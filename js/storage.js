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
      eb: 150,
      diamonds: 2,
      plots: {},          // tileId -> { tx, ty, rarity, rate }
      liveDiamonds: {},   // diamondId -> { lat, lon, spawnedAt }
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

  // Total EB/sec across every owned plot
  function totalRate() {
    let r = 0;
    for (const id in state.plots) r += state.plots[id].rate;
    return r;
  }

  // Apply whatever income accrued while the tab/app was closed
  function applyOfflineProgress() {
    const now = Date.now();
    const elapsedSec = Math.max(0, (now - (state.lastTick || now)) / 1000);
    const earned = elapsedSec * totalRate();
    state.eb += earned;
    state.lastTick = now;
    save();
    return earned;
  }

  return { load, save, get, reset, totalRate, applyOfflineProgress };
})();
