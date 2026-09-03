// ============================================================
// Elden Earth — diamonds
// Spawns collectible diamonds within a mile of the player,
// renders them on the map, and handles tap-to-collect.
// ============================================================
const Diamonds = (() => {
  let map = null;
  let markers = {};        // id -> Leaflet marker
  let playerPos = null;    // {lat, lon}
  let onCollect = () => {};
  let onDenied = () => {};
  let spawnTimer = null;

  function icon(dim) {
    return L.divIcon({
      className: "",
      html: `<div class="diamond-icon${dim ? " far" : ""}">◆</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  }

  function id() {
    return "d" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function withinCollectRange(lat, lon) {
    if (!playerPos) return false;
    return Geo.haversine(playerPos.lat, playerPos.lon, lat, lon) <= CONFIG.DIAMOND_COLLECT_RADIUS_METERS;
  }

  function renderAll() {
    const state = Store.get();
    const live = state.liveDiamonds;

    // remove stale markers
    for (const mid in markers) {
      if (!live[mid]) { map.removeLayer(markers[mid]); delete markers[mid]; }
    }
    // add/update markers
    for (const did in live) {
      const d = live[did];
      const dim = !withinCollectRange(d.lat, d.lon);
      if (markers[did]) {
        markers[did].setIcon(icon(dim));
      } else {
        const m = L.marker([d.lat, d.lon], { icon: icon(dim) }).addTo(map);
        m.on("click", () => attemptCollect(did));
        markers[did] = m;
      }
    }
  }

  function attemptCollect(did) {
    const state = Store.get();
    const d = state.liveDiamonds[did];
    if (!d) return;
    if (!withinCollectRange(d.lat, d.lon)) {
      onDenied();
      return;
    }
    delete state.liveDiamonds[did];
    state.diamonds += 1;
    Store.save();
    if (markers[did]) { map.removeLayer(markers[did]); delete markers[did]; }
    onCollect();
  }

  function pruneExpired() {
    const state = Store.get();
    const now = Date.now();
    let changed = false;
    for (const did in state.liveDiamonds) {
      if (now - state.liveDiamonds[did].spawnedAt > CONFIG.DIAMOND_LIFETIME_MS) {
        delete state.liveDiamonds[did];
        changed = true;
      }
    }
    if (changed) Store.save();
  }

  function trySpawn() {
    if (!playerPos) return;
    const state = Store.get();
    pruneExpired();
    const count = Object.keys(state.liveDiamonds).length;
    if (count >= CONFIG.DIAMOND_MAX_ACTIVE) return;
    const p = Geo.randomPointInRadius(playerPos.lat, playerPos.lon, CONFIG.DIAMOND_SPAWN_RADIUS_METERS);
    state.liveDiamonds[id()] = { lat: p.lat, lon: p.lon, spawnedAt: Date.now() };
    Store.save();
    renderAll();
  }

  function seedIfEmpty() {
    const state = Store.get();
    if (Object.keys(state.liveDiamonds).length === 0) {
      // Seed a handful right away so there's something to find immediately.
      for (let i = 0; i < 6; i++) trySpawn();
    }
  }

  function init(leafletMap, callbacks) {
    map = leafletMap;
    onCollect = callbacks.onCollect || onCollect;
    onDenied = callbacks.onDenied || onDenied;
    spawnTimer = setInterval(trySpawn, CONFIG.DIAMOND_SPAWN_CHECK_MS);
  }

  function setPlayerPosition(lat, lon) {
    playerPos = { lat, lon };
    seedIfEmpty();
    renderAll();
  }

  return { init, setPlayerPosition, renderAll };
})();
