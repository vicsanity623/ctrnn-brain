// ============================================================
// Elden Earth — 3D Parcel Foliage & Grass (Realistic Grounded Layer)
// ============================================================
const Foliage = (() => {
  let mapInstance = null;
  let isImageLoaded = false;

  // Realistic, multi-layered stylized grass sprite with organic blade curvatures & lighting
  function createGrassImage(callback) {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
        <defs>
          <!-- Sunlit Highlights -->
          <linearGradient id="bladeFront" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#a8f5ec"/>
            <stop offset="25%" stop-color="#58d68d"/>
            <stop offset="85%" stop-color="#1e824c"/>
            <stop offset="100%" stop-color="#0e4425"/>
          </linearGradient>

          <!-- Deep Forest Emerald Blade -->
          <linearGradient id="bladeBack" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#52be80"/>
            <stop offset="40%" stop-color="#229954"/>
            <stop offset="90%" stop-color="#145a32"/>
            <stop offset="100%" stop-color="#0b301a"/>
          </linearGradient>

          <!-- Golden Sunlit Tip Blade -->
          <linearGradient id="bladeGold" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#f9e79f"/>
            <stop offset="30%" stop-color="#48c9b0"/>
            <stop offset="85%" stop-color="#16a085"/>
            <stop offset="100%" stop-color="#0b301a"/>
          </linearGradient>

          <!-- Soft Contact Ground Shadow -->
          <radialGradient id="rootShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(0,0,0,0.7)"/>
            <stop offset="60%" stop-color="rgba(0,0,0,0.3)"/>
            <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
          </radialGradient>
        </defs>

        <!-- 1. Ground Contact Shadow (Binds roots firmly to the parcel surface) -->
        <ellipse cx="64" cy="122" rx="42" ry="6" fill="url(#rootShadow)"/>

        <!-- 2. Back Layer Blades (Deep Shading) -->
        <path d="M 64 122 Q 32 85 24 45 Q 42 68 64 122" fill="url(#bladeBack)" opacity="0.9"/>
        <path d="M 64 122 Q 96 82 106 42 Q 88 66 64 122" fill="url(#bladeBack)" opacity="0.9"/>

        <!-- 3. Mid Layer Blades (Natural Arching Curve) -->
        <path d="M 64 122 Q 44 70 38 28 Q 54 58 64 122" fill="url(#bladeFront)"/>
        <path d="M 64 122 Q 84 68 92 25 Q 74 56 64 122" fill="url(#bladeGold)"/>
        <path d="M 64 122 Q 52 50 48 12 Q 60 45 64 122" fill="url(#bladeFront)"/>
        <path d="M 64 122 Q 76 52 80 14 Q 68 46 64 122" fill="url(#bladeBack)"/>

        <!-- 4. Tall Center Hero Blades -->
        <path d="M 64 122 Q 60 40 64 4 Q 68 40 64 122" fill="url(#bladeGold)"/>

        <!-- 5. Foreground Micro-Sprouts (Adds Density at Base) -->
        <path d="M 64 122 Q 54 95 48 72 Q 58 88 64 122" fill="#a8f5ec" opacity="0.85"/>
        <path d="M 64 122 Q 74 96 80 74 Q 70 88 64 122" fill="#58d68d" opacity="0.85"/>
      </svg>
    `;

    const img = new Image(128, 128);
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

    // Upright Standing Grass Layer (Grounded at the bottom root)
    mapInstance.addLayer({
      id: "foliage-layer",
      type: "symbol",
      source: "foliage-source",
      minzoom: 16.5,
      layout: {
        "icon-image": "foliage-grass",
        "icon-anchor": "bottom",               // <--- Pins root to parcel surface!
        "icon-pitch-alignment": "viewport",    // Stands vertically upright
        "icon-rotation-alignment": "viewport", // Faces camera continuously
        "icon-size": [
          "interpolate",
          ["linear"],
          ["zoom"],
          16.5, 0.28,
          18.5, 0.55,
          20, 0.85
        ],
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
      },
      paint: {
        "icon-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          16.5, 0,
          17.2, 0.95
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

      // Centroid of the parcel
      const c = Geo.fromMercator(
        px * tileSize + tileSize / 2,
        py * tileSize + tileSize / 2
      );

      // Distribute 6 grass tufts across each 10x10ft parcel
      const offsets = [
        [0, 0],
        [-0.000018, -0.000018],
        [0.000018, -0.000018],
        [-0.000018, 0.000018],
        [0.000018, 0.000018],
        [0, 0.000022],
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