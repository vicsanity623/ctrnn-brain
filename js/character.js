// ============================================================
// Elden Earth — 3D WebGL Engine (Character + 3D Land Props)
// ============================================================
const Character3D = (() => {
  let mapInstance = null;
  let customLayer = null;
  let scene, camera, renderer;
  let mixer = null;
  let currentAction = null;
  let animationsMap = {};
  let currentModel = null;
  let playerCoords = { lng: -112.0740, lat: 33.4484 };
  let lastPosTime = Date.now();
  let lastCoords = null;
  let isWalking = false;
  let modelHeading = 0;

  // 3D Parcel Props System
  let plotsGroup = null;
  const propTemplates = {}; // key -> THREE.Group template
  let pendingPlotsData = null;

  function init(map, initialLng, initialLat) {
    mapInstance = map;
    playerCoords = { lng: initialLng, lat: initialLat };

    // Mapbox Custom WebGL Layer for Three.js
    customLayer = {
      id: "3d-player-character",
      type: "custom",
      renderingMode: "3d",
      onAdd: function (map, gl) {
        camera = new THREE.Camera();
        scene = new THREE.Scene();

        // Balanced Lighting for Dark Fantasy Map
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xf0d38a, 2.0);
        dirLight.position.set(30, 70, 40);
        scene.add(dirLight);

        const dirLight2 = new THREE.DirectionalLight(0x4fd6c4, 1.2);
        dirLight2.position.set(-30, -50, 20);
        scene.add(dirLight2);

        renderer = new THREE.WebGLRenderer({
          canvas: map.getCanvas(),
          context: gl,
          antialias: true,
        });
        renderer.autoClear = false;

        // Container for all 3D Land Parcels
        plotsGroup = new THREE.Group();
        scene.add(plotsGroup);

        // Preload 3D Prop Templates
        preloadPropTemplates();

        // Load saved character model
        const state = Store.get();
        const selectedId = state?.player?.model3d || "soldier";
        loadModel(selectedId);

        if (pendingPlotsData) {
          updatePlots(pendingPlotsData);
          pendingPlotsData = null;
        }
      },
      render: function (gl, matrix) {
        const m = new THREE.Matrix4().fromArray(matrix);
        camera.projectionMatrix = m;

        // Position & Orient 3D Player Character (Upright & Right-Side Up)
        if (currentModel) {
          const modelCoord = mapboxgl.MercatorCoordinate.fromLngLat(
            [playerCoords.lng, playerCoords.lat],
            0
          );
          const meterScale = modelCoord.meterInMercatorCoordinateUnits();
          const pScale = meterScale * (currentModel.userData.scale || 4.8);

          currentModel.position.set(modelCoord.x, modelCoord.y, modelCoord.z);
          // Upright Y-flip to match Mapbox Mercator projection
          currentModel.scale.set(pScale, -pScale, pScale);
          currentModel.rotation.set(-Math.PI / 2, 0, modelHeading);
        }

        // CLEAR DEPTH BUFFER: Ensures character and 3D props render on top of road textures
        gl.clear(gl.DEPTH_BUFFER_BIT);

        renderer.resetState();
        renderer.render(scene, camera);
      },
    };

    if (mapInstance.getLayer("3d-player-character")) {
      mapInstance.removeLayer("3d-player-character");
    }
    mapInstance.addLayer(customLayer);

    // Power-Efficient Animation Loop
    let clock = new THREE.Clock();
    let animFrameId = null;

    function animate() {
      if (document.hidden) {
        animFrameId = null;
        return;
      }
      animFrameId = requestAnimationFrame(animate);
      if (mixer) {
        const delta = clock.getDelta();
        mixer.update(delta);
        if (mapInstance) mapInstance.triggerRepaint();
      }
    }
    animate();

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && !animFrameId) {
        clock.getDelta();
        animate();
      }
    });
  }

  // Pre-load all GLB templates once
  function preloadPropTemplates() {
    const loader = new THREE.GLTFLoader();

    // 1. Base Grass Tile
    if (CONFIG.BASE_GRASS_MODEL) {
      loader.load(
        CONFIG.BASE_GRASS_MODEL.file,
        (gltf) => {
          propTemplates["grass"] = { scene: gltf.scene, scale: CONFIG.BASE_GRASS_MODEL.scale };
          console.log("[Character3D] Loaded Grass Tile GLB.");
          if (pendingPlotsData) updatePlots(pendingPlotsData);
        },
        undefined,
        (err) => console.warn("[Character3D] Grass load error:", err)
      );
    }

    // 2. Rarity Props
    (CONFIG.PLOT_RARITIES || []).forEach((r) => {
      if (!r.model) return;
      loader.load(
        r.model,
        (gltf) => {
          propTemplates[r.key] = { scene: gltf.scene, scale: r.scale || 1.0 };
          console.log(`[Character3D] Loaded Prop GLB: ${r.label}`);
          if (pendingPlotsData) updatePlots(pendingPlotsData);
        },
        undefined,
        (err) => console.warn(`[Character3D] Prop ${r.key} load error:`, err)
      );
    });
  }

  // Update 3D Grass and Props for all claimed plots on the map
  function updatePlots(allPlots) {
    if (!plotsGroup) {
      pendingPlotsData = allPlots;
      return;
    }

    // Clear old plot meshes
    while (plotsGroup.children.length > 0) {
      plotsGroup.remove(plotsGroup.children[0]);
    }

    const tileSize = CONFIG.TILE_SIZE_METERS || 6.096;

    for (const tid in allPlots) {
      const p = allPlots[tid];
      const rarityKey = p.rarity?.key || p.rarity || "common";

      const px = parseInt(p.tx, 10);
      const py = parseInt(p.ty, 10);

      // Tile Centroid in Mercator
      const centerMerc = Geo.fromMercator(
        px * tileSize + tileSize / 2,
        py * tileSize + tileSize / 2
      );

      const tileCoord = mapboxgl.MercatorCoordinate.fromLngLat(
        [centerMerc.lon, centerMerc.lat],
        0
      );
      const meterScale = tileCoord.meterInMercatorCoordinateUnits();

      // 1. Mount 3D Grass Tile (Upright on ground surface)
      if (propTemplates["grass"]) {
        const grass = propTemplates["grass"].scene.clone();
        const gScale = meterScale * tileSize * (propTemplates["grass"].scale || 0.08);
        grass.position.set(tileCoord.x, tileCoord.y, tileCoord.z);
        grass.scale.set(gScale, -gScale, gScale);
        grass.rotation.set(-Math.PI / 2, 0, 0);
        plotsGroup.add(grass);
      }

      // 2. Mount 3D Rarity Prop (Upright tree planted in ground, trunk down, leaves up!)
      if (propTemplates[rarityKey]) {
        const prop = propTemplates[rarityKey].scene.clone();
        const pScale = meterScale * tileSize * (propTemplates[rarityKey].scale || 0.10);
        prop.position.set(tileCoord.x, tileCoord.y, tileCoord.z);
        prop.scale.set(pScale, -pScale, pScale);

        // Organic random Y-rotation per plot
        const seed = Math.sin(px * 12.9898 + py * 78.233) * 43758.5453;
        const randomRot = (seed - Math.floor(seed)) * Math.PI * 2;
        prop.rotation.set(-Math.PI / 2, 0, randomRot);

        plotsGroup.add(prop);
      }
    }

    if (mapInstance) mapInstance.triggerRepaint();
  }

  function loadModel(characterId) {
    const config = CONFIG.AVAILABLE_CHARACTERS.find((c) => c.id === characterId) || CONFIG.AVAILABLE_CHARACTERS[0];
    const loader = new THREE.GLTFLoader();

    loader.load(
      config.file,
      (gltf) => {
        if (currentModel) scene.remove(currentModel);

        currentModel = gltf.scene;
        currentModel.userData.scale = config.scale;

        // Set up skeletal animation clips
        mixer = new THREE.AnimationMixer(currentModel);
        animationsMap = {};

        gltf.animations.forEach((clip) => {
          animationsMap[clip.name.toLowerCase()] = mixer.clipAction(clip);
        });

        // Auto-detect Idle and Walk animations
        const idleKey = Object.keys(animationsMap).find(k => k.includes("idle") || k.includes("survey") || k.includes("static")) || Object.keys(animationsMap)[0];
        const walkKey = Object.keys(animationsMap).find(k => k.includes("walk") || k.includes("run") || k.includes("move")) || Object.keys(animationsMap)[1];

        if (idleKey && animationsMap[idleKey]) {
          currentAction = animationsMap[idleKey];
          currentAction.setEffectiveTimeScale(0.8);
          currentAction.play();
        }

        if (walkKey && animationsMap[walkKey]) {
          animationsMap[walkKey].setEffectiveTimeScale(0.55);
        }

        currentModel.userData.idleKey = idleKey;
        currentModel.userData.walkKey = walkKey;

        scene.add(currentModel);
        console.log(`[Character3D] Loaded ${config.name} successfully.`);
      },
      undefined,
      (err) => console.warn("[Character3D] Load error:", err)
    );
  }

  function setPlayerPosition(lng, lat) {
    const now = Date.now();
    playerCoords = { lng, lat };

    if (lastCoords) {
      const dist = Geo.haversine(lastCoords.lat, lastCoords.lng, lat, lng);
      const elapsed = (now - lastPosTime) / 1000;
      const speed = elapsed > 0 ? dist / elapsed : 0;

      if (dist > 0.5) {
        modelHeading = Math.atan2(lng - lastCoords.lng, lat - lastCoords.lat);
      }

      const walkingNow = speed > 0.45;
      if (walkingNow !== isWalking && currentModel) {
        isWalking = walkingNow;
        const nextKey = isWalking ? currentModel.userData.walkKey : currentModel.userData.idleKey;

        if (nextKey && animationsMap[nextKey] && currentAction !== animationsMap[nextKey]) {
          const nextAction = animationsMap[nextKey];
          nextAction.reset().fadeIn(0.3).play();
          if (currentAction) currentAction.fadeOut(0.3);
          currentAction = nextAction;
        }
      }
    }

    lastCoords = { lng, lat };
    lastPosTime = now;
  }

  function changeCharacter(characterId) {
    const state = Store.get();
    if (!state.player) state.player = {};
    state.player.model3d = characterId;
    Store.save();
    loadModel(characterId);
  }

  return { init, setPlayerPosition, changeCharacter, loadModel, updatePlots };
})();
