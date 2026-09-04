// ============================================================
// Elden Earth — land grid & real-time multiplayer sync (Mapbox 3D)
// ============================================================
const Grid = (() => {
  let map = null;
  let onBuyAttempt = () => {};
  let pendingTile = null;
  let globalPlots = {};
  let activeMarkers = [];

  function tileId(tx, ty) { return tx + "_" + ty; }

  function pickRarity() {
    const rarities = CONFIG.PLOT_RARITIES;
    const totalWeight = rarities.reduce((s, r) => s + r.weight, 0);
    let roll = Math.random() * totalWeight;
    for (const r of rarities) {
      if (roll < r.weight) return r;
      roll -= r.weight;
    }
    return rarities[0];
  }

  function rarityInfo(key) {
    return CONFIG.PLOT_RARITIES.find(r => r.key === key) || CONFIG.PLOT_RARITIES[0];
  }

  function getAllPlots() {
    const state = Store.get();
    return Object.assign({}, globalPlots, state.plots);
  }

  function promptBuyTile(tx, ty) {
    const state = Store.get();
    const tid = tileId(tx, ty);
    const allPlots = getAllPlots();

    if (allPlots[tid]) {
      const owner = allPlots[tid].ownerName || "another player";
      alert(`This tile is already claimed by ${owner}!`);
      return;
    }

    if (state.eb < CONFIG.PLOT_COST_EB) {
      onBuyAttempt(false, null);
      return;
    }

    pendingTile = { tx, ty };
    const modal = document.getElementById("buy-modal");
    if (modal) modal.classList.remove("hidden");
  }

  async function executeBuy() {
    if (!pendingTile) return;
    const { tx, ty } = pendingTile;
    pendingTile = null;

    const modal = document.getElementById("buy-modal");
    if (modal) modal.classList.add("hidden");

    const state = Store.get();
    const tid = tileId(tx, ty);
    const allPlots = getAllPlots();
    if (allPlots[tid] || state.eb < CONFIG.PLOT_COST_EB) return;

    state.eb -= CONFIG.PLOT_COST_EB;
    const rarity = pickRarity();

    // Floating Combat Text on Mapbox
    if (map) {
      const corners = Geo.tileBounds(tx, ty, CONFIG.TILE_SIZE_METERS);
      const centerLat = (corners[0][0] + corners[2][0]) / 2;
      const centerLon = (corners[0][1] + corners[2][1]) / 2;
      const pt = map.project([centerLon, centerLat]);

      const popup = document.createElement("div");
      popup.className = "combat-text-popup";
      popup.style.left = `${pt.x}px`;
      popup.style.top = `${pt.y}px`;
      popup.innerHTML = `+1 ${rarity.label} Plot!`;
      document.body.appendChild(popup);
      setTimeout(() => popup.remove(), 1100);
    }

    const plotData = {
      tx,
      ty,
      rarity: rarity.key,
      rate: rarity.rate,
      ownerId: state.player.id || "guest-" + Math.random().toString(36).slice(2, 8),
      ownerName: state.player.name || "Traveler",
      avatar: state.player.avatar || "🙂",
      claimedAt: Date.now(),
    };

    state.plots[tid] = plotData;
    globalPlots[tid] = plotData;
    Store.save();
    onBuyAttempt(true, rarity);
    render();

    // Broadcast live claim to Firebase
    const db = Store.getDb();
    if (db) {
      try {
        await db.collection("plots").doc(tid).set(plotData);
      } catch (err) {
        console.warn("[Multiplayer] Broadcast error:", err);
      }
    }
  }

  function visibleTileRange() {
    const bounds = map.getBounds();
    const ts = CONFIG.TILE_SIZE_METERS;
    const sw = Geo.tileForLatLon(bounds.getSouth(), bounds.getWest(), ts);
    const ne = Geo.tileForLatLon(bounds.getNorth(), bounds.getEast(), ts);
    return {
      minTx: Math.min(sw.tx, ne.tx), maxTx: Math.max(sw.tx, ne.tx),
      minTy: Math.min(sw.ty, ne.ty), maxTy: Math.max(sw.ty, ne.ty),
    };
  }

  function render() {
    if (!map || !map.isStyleLoaded()) return;

    activeMarkers.forEach(m => m.remove());
    activeMarkers = [];

    const state = Store.get();
    const allPlots = getAllPlots();
    const zoom = map.getZoom();

    // 1. RENDER CLAIMED PLOTS (Flush on Ground Level)
    const claimedFeatures = [];
    for (const tid in allPlots) {
      const plot = allPlots[tid];
      const bounds = Geo.tileBounds(plot.tx, plot.ty, CONFIG.TILE_SIZE_METERS);
      const coords = bounds.map(pt => [pt[1], pt[0]]);
      coords.push(coords[0]); // Close polygon ring

      claimedFeatures.push({
        type: "Feature",
        properties: {
          color: rarityInfo(plot.rarity).color,
          rarity: plot.rarity,
          ownerId: plot.ownerId,
        },
        geometry: { type: "Polygon", coordinates: [coords] },
      });
    }

    const claimedGeoJSON = { type: "FeatureCollection", features: claimedFeatures };

    if (map.getSource("plots-source")) {
      map.getSource("plots-source").setData(claimedGeoJSON);
    } else {
      map.addSource("plots-source", { type: "geojson", data: claimedGeoJSON });

      // Insert under 3D buildings so buildings sit cleanly on top
      const beforeId = map.getLayer("3d-buildings") ? "3d-buildings" : undefined;

      map.addLayer({
        id: "plots-fill",
        type: "fill",
        source: "plots-source",
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": 0.58,
        },
      }, beforeId);

      map.addLayer({
        id: "plots-line",
        type: "line",
        source: "plots-source",
        paint: {
          "line-color": ["get", "color"],
          "line-width": 2,
        },
      }, beforeId);
    }

    // 2. RENDER EMPTY PURCHASE GRID (Under 3D buildings when zoomed in)
    const emptyGridFeatures = [];
    if (zoom >= (CONFIG.GRID_RENDER_MIN_ZOOM || 16.5)) {
      const { minTx, maxTx, minTy, maxTy } = visibleTileRange();
      const count = (maxTx - minTx + 1) * (maxTy - minTy + 1);

      if (count <= (CONFIG.GRID_RENDER_MAX_TILES || 1200)) {
        for (let tx = minTx; tx <= maxTx; tx++) {
          for (let ty = minTy; ty <= maxTy; ty++) {
            const tid = tileId(tx, ty);
            if (allPlots[tid]) continue; // Skip claimed tiles

            const bounds = Geo.tileBounds(tx, ty, CONFIG.TILE_SIZE_METERS);
            const coords = bounds.map(pt => [pt[1], pt[0]]);
            coords.push(coords[0]);

            emptyGridFeatures.push({
              type: "Feature",
              properties: { tx, ty },
              geometry: { type: "Polygon", coordinates: [coords] },
            });
          }
        }
      }
    }

    const emptyGeoJSON = { type: "FeatureCollection", features: emptyGridFeatures };

    if (map.getSource("empty-grid-source")) {
      map.getSource("empty-grid-source").setData(emptyGeoJSON);
    } else {
      map.addSource("empty-grid-source", { type: "geojson", data: emptyGeoJSON });

      const beforeId = map.getLayer("3d-buildings") ? "3d-buildings" : undefined;

      map.addLayer({
        id: "empty-grid-fill",
        type: "fill",
        source: "empty-grid-source",
        paint: {
          "fill-color": "#ffffff",
          "fill-opacity": 0.02,
        },
      }, beforeId);

      map.addLayer({
        id: "empty-grid-line",
        type: "line",
        source: "empty-grid-source",
        paint: {
          "line-color": "rgba(233, 223, 200, 0.28)",
          "line-width": 1,
        },
      }, beforeId);
    }

    // 3. RENDER AVATARS & EXTRACTOR BEACONS
    if (zoom >= 14) {
      const visited = new Set();
      let playerExtractorRendered = false;

      for (const tid in allPlots) {
        if (visited.has(tid)) continue;
        visited.add(tid);

        const p = allPlots[tid];
        const centerMerc = Geo.fromMercator(
          p.tx * CONFIG.TILE_SIZE_METERS + CONFIG.TILE_SIZE_METERS / 2,
          p.ty * CONFIG.TILE_SIZE_METERS + CONFIG.TILE_SIZE_METERS / 2
        );

        const isSelf = p.ownerId === state.player.id;
        const avatar = isSelf ? (state.player.avatar || "🙂") : (p.avatar || "🙂");

        const innerContent = avatar.startsWith("img:")
          ? `<img src="${avatar.slice(4)}" style="width:24px;height:24px;border-radius:50%;object-fit:cover;display:block;">`
          : `<span style="font-size:13px;line-height:1;">${avatar}</span>`;

        const el = document.createElement("div");
        el.className = "custom-plot-icon";
        el.innerHTML = `<div style="width:24px;height:24px;border-radius:50%;border:2px solid #d4af61;background:#0d1420;box-shadow:0 0 10px rgba(0,0,0,0.9), 0 0 6px rgba(212,175,97,0.4);display:flex;align-items:center;justify-content:center;overflow:hidden;cursor:pointer;">${innerContent}</div>`;
        el.addEventListener("click", () => {
          const evt = new CustomEvent("openPlayerInfo", { detail: { cluster: [p], isSelf } });
          window.dispatchEvent(evt);
        });

        const m = new mapboxgl.Marker({ element: el, pitchAlignment: "map", rotationAlignment: "map" })
          .setLngLat([centerMerc.lon, centerMerc.lat])
          .addTo(map);

        activeMarkers.push(m);

        // 3D Extractor Beacon
        if (isSelf && Object.keys(state.plots || {}).length >= (CONFIG.EXTRACTOR_MIN_TILES || 5) && !playerExtractorRendered) {
          playerExtractorRendered = true;

          const beaconEl = document.createElement("div");
          beaconEl.className = "extractor-3d-wrap";
          beaconEl.innerHTML = `
            <div class="beacon-root">
              <div class="beacon-ground-aura"></div>
              <div class="orbit-ring ring-1"></div>
              <div class="orbit-ring ring-2"></div>
              <div class="beacon-core-gem">
                <svg viewBox="0 0 32 38" class="beacon-svg">
                  <polygon points="16,2 29,12 16,16 3,12" fill="#d4fbf6"/>
                  <polygon points="3,12 16,16 16,36" fill="#1d7a6e"/>
                  <polygon points="29,12 16,16 16,36" fill="#4fd6c4"/>
                  <polygon points="16,2 20,8 16,16 12,8" fill="#ffffff"/>
                </svg>
              </div>
            </div>
          `;
          beaconEl.addEventListener("click", () => {
            const evt = new CustomEvent("openExtractorModal");
            window.dispatchEvent(evt);
          });

          const extMarker = new mapboxgl.Marker({ element: beaconEl, pitchAlignment: "map", rotationAlignment: "map" })
            .setLngLat([centerMerc.lon + 0.0001, centerMerc.lat + 0.0001])
            .addTo(map);

          activeMarkers.push(extMarker);
        }
      }
    }
  }

  function listenToGlobalPlots() {
    const db = Store.getDb();
    if (!db) return;

    try {
      db.collection("plots").onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const tid = change.doc.id;
          const data = change.doc.data();
          if (change.type === "added" || change.type === "modified") {
            globalPlots[tid] = data;
          } else if (change.type === "removed") {
            delete globalPlots[tid];
          }
        });
        render();
      }, (err) => console.warn("[Multiplayer] Sync error:", err));
    } catch (err) {
      console.warn("[Multiplayer] Listener error:", err);
    }
  }

  function init(mapboxMap, callbacks) {
    map = mapboxMap;
    onBuyAttempt = callbacks.onBuyAttempt || onBuyAttempt;

    map.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      const t = Geo.tileForLatLon(lat, lng, CONFIG.TILE_SIZE_METERS);
      promptBuyTile(t.tx, t.ty);
    });

    map.on("moveend zoomend", render);
    listenToGlobalPlots();
    render();
  }

  return { init, render, promptBuyTile, getAllPlots };
})();