// ============================================================
// Elden Earth — 3D Parcel Foliage & Mushroom Landmarks (Mapbox 2.5D Engine)
// ============================================================
const Foliage = (() => {
  let mapInstance = null;
  let isImageLoaded = false;
  let activeMarkers = []; // HTML billboard markers for 3D GLB props

  // Realistic stylized grass sprite generator
  function createGrassImage(callback) {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
        <defs>
          <linearGradient id="bladeFront" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#a8f5ec"/>
            <stop offset="25%" stop-color="#58d68d"/>
            <stop offset="85%" stop-color="#1e824c"/>
            <stop offset="100%" stop-color="#0e4425"/>
          </linearGradient>
          <linearGradient id="bladeBack" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#52be80"/>
            <stop offset="40%" stop-color="#229954"/>
            <stop offset="90%" stop-color="#145a32"/>
            <stop offset="100%" stop-color="#0b301a"/>
          </linearGradient>
          <linearGradient id="bladeGold" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#f9e79f"/>
            <stop offset="30%" stop-color="#48c9b0"/>
            <stop offset="85%" stop-color="#16a085"/>
            <stop offset="100%" stop-color="#0b301a"/>
          </linearGradient>
          <radialGradient id="rootShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(0,0,0,0.7)"/>
            <stop offset="60%" stop-color="rgba(0,0,0,0.3)"/>
            <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
          </radialGradient>
        </defs>
        <ellipse cx="64" cy="122" rx="42" ry="6" fill="url(#rootShadow)"/>
        <path d="M 64 122 Q 32 85 24 45 Q 42 68 64 122" fill="url(#bladeBack)" opacity="0.9"/>
        <path d="M 64 122 Q 96 82 106 42 Q 88 66 64 122" fill="url(#bladeBack)" opacity="0.9"/>
        <path d="M 64 122 Q 44 70 38 28 Q 54 58 64 122" fill="url(#bladeFront)"/>
        <path d="M 64 122 Q 84 68 92 25 Q 74 56 64 122" fill="url(#bladeGold)"/>
        <path d="M 64 122 Q 52 50 48 12 Q 60 45 64 122" fill="url(#bladeFront)"/>
        <path d="M 64 122 Q 76 52 80 14 Q 68 46 64 122" fill="url(#bladeBack)"/>
        <path d="M 64 122 Q 60 40 64 4 Q 68 40 64 122" fill="url(#bladeGold)"/>
        <path d="M 64 122 Q 54 95 48 72 Q 58 88 64 122" fill="#a8f5ec" opacity="0.85"/>
        <path d="M 64 122 Q 74 96 80 74 Q 70 88 64 122" fill="#58d68d" opacity="0.85"/>
      </svg>
    `;

    const img = new Image(128, 128);
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    img.onload = () => callback(img);
  }

  // Preload and cache the 3D Mushroom model
  let mushroomGLTF = null;
  function preloadMushroom() {
    if (typeof THREE === "undefined" || !THREE.GLTFLoader) return;
    const loader = new THREE.GLTFLoader();
    loader.load(
      "models/mush_common.glb",
      (gltf) => {
        mushroomGLTF = gltf;
        console.log("[Foliage] 3D mush_common.glb loaded successfully.");
        update();
      },
      undefined,
      (err) => console.warn("[Foliage] mush_common.glb load notice:", err)
    );
  }

  // Creates a clean, isolated 3D canvas for a single parcel mushroom
  function create3DMushroomElement() {
    const wrap = document.createElement("div");
    wrap.className = "parcel-prop-wrap";

    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    canvas.className = "parcel-prop-canvas";
    wrap.appendChild(canvas);

    // Mini Three.js Scene inside the marker
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 1.2, 2.5);
    camera.lookAt(0, 0.4, 0);

    const ambLight = new THREE.AmbientLight(0xffffff, 1.6);
    scene.add(ambLight);

    const dirLight = new THREE.DirectionalLight(0xf0d38a, 2.2);
    dirLight.position.set(3, 5, 4);
    scene.add(dirLight);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true
    });
    renderer.setSize(32, 32);

    if (mushroomGLTF) {
      const clone = mushroomGLTF.scene.clone();
      
      // Auto-fit bounding box to 10x10 cell proportion
      const box = new THREE.Box3().setFromObject(clone);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const scale = 1.1 / maxDim; // Fits inside 32px viewport
      clone.scale.set(scale, scale, scale);

      // Center at base
      box.setFromObject(clone);
      clone.position.y = -box.min.y;

      scene.add(clone);
      renderer.render(scene, camera);
    }

    return wrap;
  }

  function init(map) {
    mapInstance = map;
    preloadMushroom();

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

    // Upright Standing Grass Layer
    mapInstance.addLayer({
      id: "foliage-layer",
      type: "symbol",
      source: "foliage-source",
      minzoom: 16.5,
      layout: {
        "icon-image": "foliage-grass",
        "icon-anchor": "bottom",
        "icon-pitch-alignment": "viewport",
        "icon-rotation-alignment": "viewport",
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

    // Clear old prop markers
    activeMarkers.forEach(m => m.remove());
    activeMarkers = [];

    const allPlots = (typeof Grid !== "undefined" && Grid.getAllPlots) ? Grid.getAllPlots() : {};
    const tileSize = CONFIG.TILE_SIZE_METERS || 6.096;
    const grassFeatures = [];
    const zoom = mapInstance.getZoom();

    for (const tid in allPlots) {
      const p = allPlots[tid];
      const rarityKey = p.rarity?.key || p.rarity || "common";
      const px = parseInt(p.tx, 10);
      const py = parseInt(p.ty, 10);

      // Centroid of the parcel
      const c = Geo.fromMercator(
        px * tileSize + tileSize / 2,
        py * tileSize + tileSize / 2
      );

      // 1. Distribute grass tufts across every claimed parcel
      const offsets = [
        [-0.000018, -0.000018],
        [0.000018, -0.000018],
        [-0.000018, 0.000018],
        [0.000018, 0.000018],
      ];

      offsets.forEach(([dLon, dLat]) => {
        grassFeatures.push({
          type: "Feature",
          geometry: { type: "Point", coordinates: [c.lon + dLon, c.lat + dLat] }
        });
      });

      // 2. If Common Plot, place the 3D Common Mushroom in the center of the parcel!
      if (rarityKey === "common" && zoom >= 15.5) {
        const mushEl = create3DMushroomElement();
        const m = new mapboxgl.Marker({
          element: mushEl,
          anchor: "bottom",              // Grounded firmly on top of the grass
          pitchAlignment: "viewport",    // Upright 3D billboard
          rotationAlignment: "viewport", // Faces player camera continuously
        })
          .setLngLat([c.lon, c.lat])
          .addTo(mapInstance);

        activeMarkers.push(m);
      }
    }

    mapInstance.getSource("foliage-source").setData({
      type: "FeatureCollection",
      features: grassFeatures,
    });
  }

  return { init, update };
})();