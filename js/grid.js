// ============================================================
// Elden Earth — land grid
// Draws the real-world 20ft tile grid near the current view,
// colors tiles the player already owns, and sells empty ones.
// ============================================================
const Grid = (() => {
  let map = null;
  let layerGroup = null;
  let onBuyAttempt = () => {};

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

  function buyTile(tx, ty) {
    const state = Store.get();
    const tid = tileId(tx, ty);
    if (state.plots[tid]) return;
    if (state.eb < CONFIG.PLOT_COST_EB) {
      onBuyAttempt(false, null);
      return;
    }

    const confirmed = confirm(`Claim this tile for ${CONFIG.PLOT_COST_EB} EB?`);
    if (!confirmed) return;

    state.eb -= CONFIG.PLOT_COST_EB;
    const rarity = pickRarity();
    state.plots[tid] = { tx, ty, rarity: rarity.key, rate: rarity.rate };
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

  function render() {
    if (!layerGroup) return;
    layerGroup.clearLayers();
    if (map.getZoom() < CONFIG.GRID_RENDER_MIN_ZOOM) return;

    const state = Store.get();
    const { minTx, maxTx, minTy, maxTy } = visibleTileRange();
    const tileCount = (maxTx - minTx + 1) * (maxTy - minTy + 1);
    if (tileCount > CONFIG.GRID_RENDER_MAX_TILES) return; // zoom in a bit more

    for (let tx = minTx; tx <= maxTx; tx++) {
      for (let ty = minTy; ty <= maxTy; ty++) {
        const tid = tileId(tx, ty);
        const owned = state.plots[tid];
        const corners = Geo.tileBounds(tx, ty, CONFIG.TILE_SIZE_METERS);

        const style = owned
          ? { color: rarityInfo(owned.rarity).color, weight: 1, fillColor: rarityInfo(owned.rarity).color, fillOpacity: 0.45 }
          : { color: "rgba(233,223,200,0.35)", weight: 1, fillColor: "#000", fillOpacity: 0.02 };

        const poly = L.polygon(corners, style);
        if (!owned) {
          poly.on("click", () => buyTile(tx, ty));
        }
        poly.addTo(layerGroup);
      }
    }
  }

  function init(leafletMap, callbacks) {
    map = leafletMap;
    onBuyAttempt = callbacks.onBuyAttempt || onBuyAttempt;
    layerGroup = L.layerGroup().addTo(map);
    map.on("moveend zoomend", render);
  }

  return { init, render, buyTile };
})();
