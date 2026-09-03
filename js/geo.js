// ============================================================
// Elden Earth — geo math helpers
// Everything the game needs to turn GPS coordinates into a
// uniform real-world grid, and to measure real distances.
// ============================================================
const Geo = (() => {
  const R = 6378137; // Earth radius (m), spherical Web Mercator

  // lat/lon (degrees) -> Web Mercator meters (matches Leaflet's default CRS)
  function toMercator(lat, lon) {
    const x = R * (lon * Math.PI / 180);
    const y = R * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI / 180) / 2));
    return { x, y };
  }

  // Web Mercator meters -> lat/lon (degrees)
  function fromMercator(x, y) {
    const lon = (x / R) * 180 / Math.PI;
    const lat = (2 * Math.atan(Math.exp(y / R)) - Math.PI / 2) * 180 / Math.PI;
    return { lat, lon };
  }

  // Great-circle distance in meters between two lat/lon points
  function haversine(lat1, lon1, lat2, lon2) {
    const toRad = d => d * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * 6371000 * Math.asin(Math.sqrt(a));
  }

  // Balanced random point (ensures healthy mix of close and far spawns)
  function randomPointInRadius(lat, lon, radiusM) {
    // 50% chance to spawn close (0 to 45% radius), 50% chance to spawn across full radius
    const isClose = Math.random() < 0.50;
    const maxR = isClose ? radiusM * 0.45 : radiusM;
    const r = maxR * Math.random();

    const theta = Math.random() * 2 * Math.PI;
    const dLat = (r * Math.cos(theta)) / 111320;
    const dLon = (r * Math.cos(theta)) / (111320 * Math.cos(lat * Math.PI / 180));
    return { lat: lat + dLat, lon: lon + dLon };
  }

  // Which grid tile (tileX, tileY) contains this lat/lon
  function tileForLatLon(lat, lon, tileSizeM) {
    const { x, y } = toMercator(lat, lon);
    return { tx: Math.floor(x / tileSizeM), ty: Math.floor(y / tileSizeM) };
  }

  // Lat/lon corner ring [[lat,lon] x5 closed] for a given tile
  function tileBounds(tx, ty, tileSizeM) {
    const x0 = tx * tileSizeM, x1 = x0 + tileSizeM;
    const y0 = ty * tileSizeM, y1 = y0 + tileSizeM;
    const c1 = fromMercator(x0, y0);
    const c2 = fromMercator(x1, y0);
    const c3 = fromMercator(x1, y1);
    const c4 = fromMercator(x0, y1);
    return [
      [c1.lat, c1.lon], [c2.lat, c2.lon],
      [c3.lat, c3.lon], [c4.lat, c4.lon],
    ];
  }

  return { toMercator, fromMercator, haversine, randomPointInRadius, tileForLatLon, tileBounds };
})();
