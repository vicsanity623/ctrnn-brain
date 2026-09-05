// ============================================================
// Elden Earth — 3D Character Model (Three.js WebGL Custom Layer)
// Renders animated .GLB models at player GPS with Idle <-> Walk blending.
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

  // 3D Parcel Props & Grass System
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

        // Balanced Lighting for Dark Map
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xf0d38a, 1.8);
        dirLight.position.set(20, 50, 20);
        scene.add(dirLight);

        const dirLight2 = new THREE.DirectionalLight(0x4fd6c4, 1.0);
        dirLight2.position.set(-20, -50, 10);
        scene.add(dirLight2);

        renderer = new THREE.WebGLRenderer({
          canvas: map.getCanvas(),
          context: gl,
          antialias: true,
        });
        renderer.autoClear = false;

        // 3D World Parcels Container
        plotsGroup = new THREE.Group();
        scene.add(plotsGroup);

        // Pre-load all 3D prop templates
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
        // Build base Mapbox Projection Matrix
        const m = new THREE.Matrix4().fromArray(matrix);
        camera.projectionMatrix = m;

        // Update 3D Character Transform
        if (currentModel) {
          const modelCoord = mapboxgl.MercatorCoordinate.fromLngLat(
            [playerCoords.lng, playerCoords.lat],
            0
          );
          const scale = modelCoord.meterInMercatorCoordinateUnits() * (currentModel.userData.scale || 1.2);

          currentModel.position.set(modelCoord.x, modelCoord.y, modelCoord.z);
          currentModel.scale.set(scale, -scale, scale);
          currentModel.rotation.set(Math.PI / 2, modelHeading, 0);
        }

        // Render entire 3D WebGL scene (Character + 3D Grass + 3D Trees/Props)
        gl.clear(gl.DEPTH_BUFFER_BIT);
        renderer.resetState();
        renderer.render(scene, camera);
      },
    };

    if (mapInstance.getLayer("3d-player-character")) {
      mapInstance.removeLayer("3d-player-character");
    }
    mapInstance.addLayer(customLayer);

    // Power-Efficient Animation Loop (Pauses when app is in background)
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
        // Only repaint when animations advance
        if (mapInstance) mapInstance.triggerRepaint();
      }
    }
    animate();

    // Auto-pause when switching tabs or locking phone to save battery
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && !animFrameId) {
        clock.getDelta(); // Reset clock delta so animation doesn't jump
        animate();
      }
    });
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
          currentAction.setEffectiveTimeScale(0.8); // Relaxed idle pace
          currentAction.play();
        }

        // Slow down walk animation so it's smooth and grounded (not running)
        if (walkKey && animationsMap[walkKey]) {
          animationsMap[walkKey].setEffectiveTimeScale(0.55); // 55% normal speed
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
      // Calculate speed in meters/second
      const dist = Geo.haversine(lastCoords.lat, lastCoords.lng, lat, lng);
      const elapsed = (now - lastPosTime) / 1000;
      const speed = elapsed > 0 ? dist / elapsed : 0;

      // Update heading angle towards movement direction
      if (dist > 0.5) {
        modelHeading = Math.atan2(lng - lastCoords.lng, lat - lastCoords.lat);
      }

      // Switch between Idle and Walk
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
  
  // Pre-load all 3D GLB Prop Models into memory once
  function preloadPropTemplates() {
    const loader = new THREE.GLTFLoader();

    // 1. Base Grass Tile
    if (CONFIG.BASE_GRASS_MODEL) {
      loader.load(
        CONFIG.BASE_GRASS_MODEL.file,
        (gltf) => {
          propTemplates["grass"] = { scene: gltf.scene, scale: CONFIG.BASE_GRASS_MODEL.scale };
          console.log("[Character3D] Loaded 3D Base Grass Tile.");
          if (pendingPlotsData) updatePlots(pendingPlotsData);
        },
        undefined,
        (err) => console.warn("[Character3D] Grass GLB error:", err)
      );
    }

    // 2. Rarity Tier Props
    (CONFIG.PLOT_RARITIES || []).forEach((r) => {
      if (!r.model) return;
      loader.load(
        r.model,
        (gltf) => {
          propTemplates[r.key] = { scene: gltf.scene, scale: r.scale || 2.5 };
          console.log(`[Character3D] Loaded 3D Prop: ${r.label}`);
          if (pendingPlotsData) updatePlots(pendingPlotsData);
        },
        undefined,
        (err) => console.warn(`[Character3D] Prop ${r.key} GLB error:`, err)
      );
    });
  }

  // Update 3D Grass and Props for all claimed plots on the map
  function updatePlots(allPlots) {
    if (!plotsGroup) {
      pendingPlotsData = allPlots;
      return;
    }

    // Clear existing 3D plot meshes
    while (plotsGroup.children.length > 0) {
      plotsGroup.remove(plotsGroup.children[0]);
    }

    for (const tid in allPlots) {
      const p = allPlots[tid];
      const rarityKey = p.rarity?.key || p.rarity || "common";

      // Compute exact center of tile in real-world Mercator coordinates
      const px = parseInt(p.tx, 10);
      const py = parseInt(p.ty, 10);
      const centerMerc = Geo.fromMercator(
        px * CONFIG.TILE_SIZE_METERS + CONFIG.TILE_SIZE_METERS / 2,
        py * CONFIG.TILE_SIZE_METERS + CONFIG.TILE_SIZE_METERS / 2
      );

      const tileCoord = mapboxgl.MercatorCoordinate.fromLngLat(
        [centerMerc.lon, centerMerc.lat],
        0
      );
      const meterScale = tileCoord.meterInMercatorCoordinateUnits();

      // 1. Add 3D Grass Tile Mesh
      if (propTemplates["grass"]) {
        const grassClone = propTemplates["grass"].scene.clone();
        const gScale = meterScale * propTemplates["grass"].scale;
        grassClone.position.set(tileCoord.x, tileCoord.y, tileCoord.z);
        grassClone.scale.set(gScale, -gScale, gScale);
        grassClone.rotation.set(Math.PI / 2, 0, 0);
        plotsGroup.add(grassClone);
      }

      // 2. Add 3D Rarity Prop (Tree, Crystal, Obelisk, Erdtree)
      if (propTemplates[rarityKey]) {
        const propClone = propTemplates[rarityKey].scene.clone();
        const pScale = meterScale * propTemplates[rarityKey].scale;
        propClone.position.set(tileCoord.x, tileCoord.y, tileCoord.z);
        propClone.scale.set(pScale, -pScale, pScale);
        
        // Random subtle rotation variation for organic variety
        const seed = Math.sin(px * 12.9898 + py * 78.233) * 43758.5453;
        const randomRot = (seed - Math.floor(seed)) * Math.PI * 2;
        propClone.rotation.set(Math.PI / 2, randomRot, 0);

        plotsGroup.add(propClone);
      }
    }

    if (mapInstance) mapInstance.triggerRepaint();
  }

  return { init, setPlayerPosition, changeCharacter, loadModel, updatePlots };
})();
