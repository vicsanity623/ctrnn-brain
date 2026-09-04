// ============================================================
// Elden Earth — land grid & real-time multiplayer sync
// ============================================================
const Grid = (() => {
  let map = null;
  let emptyGridLayer = null;
  let ownedPlotsLayer = null;
  let avatarMarkersLayer = null;
  let onBuyAttempt = () => {};
  let pendingTile = null;
  let globalPlots = {}; // All plots across all players worldwide

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

    // Prevent buying if claimed by ANY player
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

    // Trigger floating combat text at land claim point
    if (map) {
      const corners = Geo.tileBounds(tx, ty, CONFIG.TILE_SIZE_METERS);
      const centerLat = (corners[0][0] + corners[2][0]) / 2;
      const centerLon = (corners[0][1] + corners[2][1]) / 2;
      const pt = map.latLngToContainerPoint([centerLat, centerLon]);

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

    // Save locally
    state.plots[tid] = plotData;
    globalPlots[tid] = plotData;
    Store.save();
    onBuyAttempt(true, rarity);
    render();

    // Broadcast live claim to Firebase Firestore
    const db = Store.getDb();
    if (db) {
      try {
        await db.collection("plots").doc(tid).set(plotData);
        console.log(`[Multiplayer] Claim broadcasted for tile ${tid}`);
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

  // Flood Fill cluster grouping for all players
  function getConnectedClusters(plots) {
    const visited = new Set();
    const clusters = [];

    for (const tid in plots) {
      if (visited.has(tid)) continue;

      const cluster = [];
      const queue = [plots[tid]];
      visited.add(tid);
      const owner = plots[tid].ownerId;

      while (queue.length > 0) {
        const current = queue.shift();
        cluster.push(current);

        const neighbors = [
          tileId(current.tx + 1, current.ty),
          tileId(current.tx - 1, current.ty),
          tileId(current.tx, current.ty + 1),
          tileId(current.tx, current.ty - 1),
        ];

        for (const nId of neighbors) {
          if (plots[nId] && !visited.has(nId) && plots[nId].ownerId === owner) {
            visited.add(nId);
            queue.push(plots[nId]);
          }
        }
      }
      clusters.push(cluster);
    }
    return clusters;
  }

  function render() {
    if (!emptyGridLayer || !ownedPlotsLayer || !avatarMarkersLayer) return;

    emptyGridLayer.clearLayers();
    ownedPlotsLayer.clearLayers();
    avatarMarkersLayer.clearLayers();

    const state = Store.get();
    const allPlots = getAllPlots();
    const zoom = map.getZoom();

    // 1. RENDER ALL WORLD PLOTS (Zoom 13+)
    if (zoom >= 13) {
      for (const tid in allPlots) {
        const plot = allPlots[tid];
        const corners = Geo.tileBounds(plot.tx, plot.ty, CONFIG.TILE_SIZE_METERS);
        const color = rarityInfo(plot.rarity).color;
        const rKey = plot.rarity?.key || plot.rarity || "common";

        L.polygon(corners, {
          color: color,
          weight: zoom >= 18 ? 2 : 1,
          fillColor: color,
          fillOpacity: 0.58,
          className: `owned-plot-3d rarity-${rKey}`,
        }).addTo(ownedPlotsLayer);
      }

      // 2. RENDER CLUSTERED AVATARS FOR ALL PLAYERS
      const clusters = getConnectedClusters(allPlots);
      let playerExtractorRendered = false;

      for (const cluster of clusters) {
        let sumLat = 0, sumLon = 0;
        for (const p of cluster) {
          const centerMerc = Geo.fromMercator(
            p.tx * CONFIG.TILE_SIZE_METERS + CONFIG.TILE_SIZE_METERS / 2,
            p.ty * CONFIG.TILE_SIZE_METERS + CONFIG.TILE_SIZE_METERS / 2
          );
          sumLat += centerMerc.lat;
          sumLon += centerMerc.lon;
        }

        const centerLat = sumLat / cluster.length;
        const centerLon = sumLon / cluster.length;
        const isSelf = cluster[0].ownerId === state.player.id;
        const avatar = isSelf ? (state.player.avatar || "🙂") : (cluster[0].avatar || "🙂");

        const innerContent = avatar.startsWith("img:")
          ? `<img src="${avatar.slice(4)}" style="width:24px;height:24px;border-radius:50%;object-fit:cover;display:block;">`
          : `<span style="font-size:13px;line-height:1;">${avatar}</span>`;

        const avatarIcon = L.divIcon({
          className: "custom-plot-icon",
          html: `<div style="width:24px;height:24px;border-radius:50%;border:2px solid #d4af61;background:#0d1420;box-shadow:0 0 10px rgba(0,0,0,0.9), 0 0 6px rgba(212,175,97,0.4);display:flex;align-items:center;justify-content:center;overflow:hidden;cursor:pointer;">${innerContent}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([centerLat, centerLon], { icon: avatarIcon, interactive: true }).addTo(avatarMarkersLayer);
        marker.on("click", () => {
          // Open player info (for self or inspected player)
          const evt = new CustomEvent("openPlayerInfo", { detail: { cluster, isSelf } });
          window.dispatchEvent(evt);
        });

        // 3D Orbital Extractor for current player
        if (isSelf && cluster.length >= (CONFIG.EXTRACTOR_MIN_TILES || 5) && !playerExtractorRendered) {
          playerExtractorRendered = true;

          const extractorIcon = L.divIcon({
            className: "extractor-3d-wrap",
            html: `
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
            `,
            iconSize: [44, 52],
            iconAnchor: [-10, 26],
          });

          const extractorMarker = L.marker([centerLat, centerLon], { icon: extractorIcon, interactive: true }).addTo(avatarMarkersLayer);
          extractorMarker.on("click", () => {
            const evt = new CustomEvent("openExtractorModal");
            window.dispatchEvent(evt);
          });
        }
      }
    }

    // 3. RENDER EMPTY BUYABLE TILES
    if (zoom >= CONFIG.GRID_RENDER_MIN_ZOOM) {
      const { minTx, maxTx, minTy, maxTy } = visibleTileRange();
      const tileCount = (maxTx - minTx + 1) * (maxTy - minTy + 1);
      if (tileCount > CONFIG.GRID_RENDER_MAX_TILES) return;

      for (let tx = minTx; tx <= maxTx; tx++) {
        for (let ty = minTy; ty <= maxTy; ty++) {
          const tid = tileId(tx, ty);
          if (allPlots[tid]) continue;

          const corners = Geo.tileBounds(tx, ty, CONFIG.TILE_SIZE_METERS);
          const poly = L.polygon(corners, {
            color: "rgba(233,223,200,0.35)",
            weight: 1,
            fillColor: "#000",
            fillOpacity: 0.02,
          });

          poly.on("click", () => promptBuyTile(tx, ty));
          poly.addTo(emptyGridLayer);
        }
      }
    }
  }

  // Real-Time Firebase Listener for Global Claims
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
      }, (err) => console.warn("[Multiplayer] Sync stream error:", err));
    } catch (err) {
      console.warn("[Multiplayer] Init listener error:", err);
    }
  }

  function init(leafletMap, callbacks) {
    map = leafletMap;
    onBuyAttempt = callbacks.onBuyAttempt || onBuyAttempt;

    ownedPlotsLayer = L.layerGroup().addTo(map);
    avatarMarkersLayer = L.layerGroup().addTo(map);
    emptyGridLayer = L.layerGroup().addTo(map);

    map.on("moveend zoomend", render);

    const confirmBtn = document.getElementById("buy-confirm-btn");
    const cancelBtn = document.getElementById("buy-cancel-btn");

    if (confirmBtn) confirmBtn.addEventListener("click", executeBuy);
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        pendingTile = null;
        const modal = document.getElementById("buy-modal");
        if (modal) modal.classList.add("hidden");
      });
    }

    // Connect WebSocket stream
    listenToGlobalPlots();
  }

  return { init, render, promptBuyTile, getAllPlots };
})();