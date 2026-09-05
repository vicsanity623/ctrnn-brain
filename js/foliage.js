// ============================================================
// Elden Earth — 3D Parcel Foliage & Grass (Mapbox GPU Layer)
// Renders upright, stylized grass blades on all claimed plots.
// ============================================================
const Foliage = (() => {
  let mapInstance = null;
  let isImageLoaded = false;

  // Generate crisp stylized grass SVG sprite into an HTML Image
  function createGrassImage(callback) {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
        <defs>
          <linearGradient id="bladeLeft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#2ecc71"/>
            <stop offset="100%" stop-color="#1b7a43"/>
          </linearGradient>
          <linearGradient id="bladeCenter" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#58d68d"/>
            <stop offset="100%" stop-color="#27ae60"/>
          </linearGradient>
          <linearGradient id="bladeRight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#a3e4d7"/>
            <stop offset="100%" stop-color="#16a085"/>
          </linearGradient>
          <radialGradient id="grassShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(0,0,0,0.5)"/>
            <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
          </radialGradient>
        </defs>

        <!-- Soft Ground Shadow -->
        <ellipse cx="32" cy="58" rx="22" ry="5" fill="url(#grassShadow)"/>

        <!-- Left Blade -->
        <path d="M 32 58 Q 18 42 12 26 Q 22 34 32 58" fill="url(#bladeLeft)" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.4))"/>

        <!-- Right Blade -->
        <path d="M 32 58 Q 46 40 52 22 Q 42 32 32 58" fill="url(#bladeRight)" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.4))"/>

        <!-- Center Tall Blade -->
        <path d="M 32 58 Q 30 28 32 10 Q 36 28 32 58" fill="url(#bladeCenter)" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))"/>

        <!-- Tiny Front Sprout -->
        <path d="M 32 58 Q 26 48 24 38 Q 28 44 32 58" fill="#7bed9f"/>
        <path d="M 32 58 Q 38 48 40 36 Q 36 44 32 58" fill="#2ecc71"/>
      </svg>
    `;

    const img = new Image(64, 64);
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    img.onload = () => callback(img);
  }

  function init(map) {
    mapInstance = map;

    createGrassImage((img) => {
      if (!mapInstance.hasImage("foliage-grass")) {
        mapInstance.addImage("foliage-grass", img, { pixelRatio: 2 });
      }
      isImageLoaded = true;
      setupLayers();
      update();
    });
  }

  function setupLayers() {
    if (!mapInstance || mapInstance.getSource("foliage-source")) return;

    mapInstance.addSource("foliage-source", {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
    });

    const layers = mapInstance.getStyle().layers;
    const labelLayerId = layers.find(l => l.type === "symbol" && l.layout && l.layout["text-field"])?.id;

    // GPU-Accelerated Upright Standing Grass Layer
    mapInstance.addLayer({
      id: "foliage-layer",
      type: "symbol",
      source: "foliage-source",
      minzoom: 16.5, // Only render when zoomed close enough to see plot details
      layout: {
        "icon-image": "foliage-grass",
        "icon-size": [
          "interpolate",
          ["linear"],
          ["zoom"],
          17, 0.45,
          18.5, 0.75,
          20, 1.1
        ],
        "icon-pitch-alignment": "viewport",    // Stands vertically upright!
        "icon-rotation-alignment": "viewport", // Faces player camera continuously
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
      },
      paint: {
        "icon-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          16.5, 0,
          17.2, 1
        ],
      },
    }, labelLayerId);
  }

  function update() {
    if (!mapInstance || !isImageLoaded || !mapInstance.getSource("foliage-source")) return;

    const allPlots = (typeof Grid !== "undefined" && Grid.getAllPlots) ? Grid.getAllPlots() : {};
    const tileSize = CONFIG.TILE_SIZE_METERS || 6.096;
    const features = [];

    for (const tid in allPlots) {
      const p = allPlots[tid];
      const px = parseInt(p.tx, 10);
      const py = parseInt(p.ty, 10);

      // Centroid of the 10x10ft plot
      const c = Geo.fromMercator(
        px * tileSize + tileSize / 2,
        py * tileSize + tileSize / 2
      );

      // Center grass tuft
      features.push({
        type: "Feature",
        geometry: { type: "Point", coordinates: [c.lon, c.lat] }
      });

      // 4 Subtle offset tufts inside the parcel perimeter
      const offsets = [
        [-0.000015, -0.000015],
        [0.000015, -0.000015],
        [-0.000015, 0.000015],
        [0.000015, 0.000015],
      ];

      offsets.forEach(([dLon, dLat]) => {
        features.push({
          type: "Feature",
          geometry: { type: "Point", coordinates: [c.lon + dLon, c.lat + dLat] }
        });
      });
    }

    mapInstance.getSource("foliage-source").setData({
      type: "FeatureCollection",
      features: features,
    });
  }

  return { init, update };
})();