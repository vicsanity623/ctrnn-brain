// ============================================================
// Elden Earth — land grid & territory clusters
// ============================================================
const Grid = (() => {
  let map = null;
  let emptyGridLayer = null;
  let ownedPlotsLayer = null;
  let avatarMarkersLayer = null;
  let onBuyAttempt = () => {};
  let pendingTile = null;

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

  function promptBuyTile(tx, ty) {
    const state = Store.get();
    const tid = tileId(tx, ty);

    // If someone already owns this tile, prevent purchase
    if (state.plots[tid]) {
      alert("This tile is already claimed!");
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

  function executeBuy() {
    if (!pendingTile) return;
    const { tx, ty } = pendingTile;
    pendingTile = null;

    const modal = document.getElementById("buy-modal");
    if (modal) modal.classList.add("hidden");

    const state = Store.get();
    const tid = tileId(tx, ty);
    if (state.plots[tid] || state.eb < CONFIG.PLOT_COST_EB) return;

    state.eb -= CONFIG.PLOT_COST_EB;
    const rarity = pickRarity();
    
    // Store owner info for multiplayer support
    state.plots[tid] = {
      tx,
      ty,
      rarity: rarity.key,
      rate: rarity.rate,
      ownerId: state.player.id || "guest",
      ownerName: state.player.name || "Traveler",
      avatar: state.player.avatar || "🙂",
    };

    Store.save();
    onBuyAttempt(true, rarity);
    render();
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

  // Group adjacent connected tiles into clusters (Flood Fill)
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

        // Check 4-directional neighbors (North, South, East, West)
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
    const zoom = map.getZoom();

    // 1. ALWAYS RENDER OWNED TILES (Visible at zoom 13+)
    if (zoom >= 13) {
      for (const tid in state.plots) {
        const plot = state.plots[tid];
        const corners = Geo.tileBounds(plot.tx, plot.ty, CONFIG.TILE_SIZE_METERS);
        const color = rarityInfo(plot.rarity).color;

        L.polygon(corners, {
          color: color,
          weight: zoom >= 18 ? 1 : 0.5,
          fillColor: color,
          fillOpacity: 0.55,
        }).addTo(ownedPlotsLayer);
      }

      // 2. RENDER SINGLE AVATAR PER CONNECTED CLUSTER
      const clusters = getConnectedClusters(state.plots);
      for (const cluster of clusters) {
        // Calculate the centroid center of this connected cluster
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
        const isSelf = cluster[0].ownerId === state.player.id || cluster[0].ownerId === "guest";         const avatar = isSelf ? (state.player.avatar || "🙂") : (cluster[0].avatar || "🙂");

        const avatarIcon = L.divIcon({
          className: "",
          html: `<div class="plot-avatar-badge">${avatar.startsWith("img:") ? `<img src="${avatar.slice(4)}">` : avatar}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([centerLat, centerLon], { icon: avatarIcon, interactive: true }).addTo(avatarMarkersLayer);
        marker.on("click", () => {
          const evt = new CustomEvent("openPlayerInfo");
          window.dispatchEvent(evt);
        });
      }
    }

    // 3. RENDER EMPTY BUYABLE TILES (Only when zoomed in close)
    if (zoom >= CONFIG.GRID_RENDER_MIN_ZOOM) {
      const { minTx, maxTx, minTy, maxTy } = visibleTileRange();
      const tileCount = (maxTx - minTx + 1) * (maxTy - minTy + 1);
      if (tileCount > CONFIG.GRID_RENDER_MAX_TILES) return;

      for (let tx = minTx; tx <= maxTx; tx++) {
        for (let ty = minTy; ty <= maxTy; ty++) {
          const tid = tileId(tx, ty);
          if (state.plots[tid]) continue; // Already rendered in owned layer

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
  }

  return { init, render, promptBuyTile };
})();