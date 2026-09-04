// ============================================================
// Elden Earth — diamonds (3D Visuals & Particle FX)
// ============================================================
const Diamonds = (() => {
  let map = null;
  let markers = {};        // id -> Leaflet marker
  let playerPos = null;    // {lat, lon}
  let onCollect = () => {};
  let onDenied = () => {};
  let spawnTimer = null;

  // 3D Faceted Crystal with ambient rising dust particles
  function icon(dim) {
    return L.divIcon({
      className: "diamond-3d-wrapper" + (dim ? " far" : ""),
      html: `
        <div class="gem-anchor">
          <div class="gem-shadow"></div>
          <div class="gem-3d">
            <svg viewBox="0 0 32 38" class="gem-svg">
              <defs>
                <linearGradient id="gemTop" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#a8f5ec"/>
                  <stop offset="100%" stop-color="#4fd6c4"/>
                </linearGradient>
                <linearGradient id="gemLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#36b8a7"/>
                  <stop offset="100%" stop-color="#1d7a6e"/>
                </linearGradient>
                <linearGradient id="gemRight" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#4fd6c4"/>
                  <stop offset="100%" stop-color="#289b8d"/>
                </linearGradient>
                <linearGradient id="gemGlint" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
                  <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <!-- 3D Facets -->
              <polygon points="16,2 29,12 16,16 3,12" fill="url(#gemTop)"/>
              <polygon points="3,12 16,16 16,36" fill="url(#gemLeft)"/>
              <polygon points="29,12 16,16 16,36" fill="url(#gemRight)"/>
              <!-- Specular Shine Edge -->
              <polygon points="16,2 20,8 16,16 12,8" fill="url(#gemGlint)"/>
            </svg>
            <div class="gem-sparkle-1">✦</div>
            <div class="gem-sparkle-2">✦</div>
            <!-- Rising ambient dust -->
            <span class="dust-particle p1"></span>
            <span class="dust-particle p2"></span>
            <span class="dust-particle p3"></span>
          </div>
        </div>
      `,
      iconSize: [36, 44],
      iconAnchor: [18, 28],
    });
  }

  // Mini Particle Burst Explosion on Tap
  function triggerParticleExplosion(lat, lon) {
    if (!map) return;
    const pt = map.latLngToContainerPoint([lat, lon]);
    const container = document.createElement("div");
    container.className = "gem-explosion-container";
    container.style.left = pt.x + "px";
    container.style.top = pt.y + "px";
    document.body.appendChild(container);

    // Spawn 10 radiant particles
    for (let i = 0; i < 10; i++) {
      const p = document.createElement("span");
      p.className = "burst-spark";
      const angle = (i / 10) * 360 + (Math.random() * 20 - 10);
      const dist = 30 + Math.random() * 35;
      const rad = (angle * Math.PI) / 180;
      p.style.setProperty("--tx", `${Math.cos(rad) * dist}px`);
      p.style.setProperty("--ty", `${Math.sin(rad) * dist}px`);
      p.style.setProperty("--scale", Math.random() * 0.5 + 0.7);
      container.appendChild(p);
    }

    setTimeout(() => container.remove(), 700);
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

    // Remove stale markers
    for (const mid in markers) {
      if (!live[mid]) { map.removeLayer(markers[mid]); delete markers[mid]; }
    }
    // Add or update markers
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

    // Trigger visual particle explosion
    triggerParticleExplosion(d.lat, d.lon);

    delete state.liveDiamonds[did];
    state.diamonds = (Number(state.diamonds) || 0) + 1;
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
      for (let i = 0; i < 4; i++) trySpawn();
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