// ============================================================
// Elden Earth — main
// Wires sign-in -> location permission -> map -> game loop.
// ============================================================
(() => {
  let map, sonarMarker, watchId;
  let currentPos = null;
  let toastTimer = null;
  let updateSonarRadiusPixels = null;

  const el = (id) => document.getElementById(id);

  function showToast(msg, ms = 2200) {
    const t = el("toast");
    t.textContent = msg;
    t.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.add("hidden"), ms);
  }

  function openModal(id) { el(id).classList.remove("hidden"); }
  function closeModal(id) { el(id).classList.add("hidden"); }

  function formatCashDisplay(cashVal) {
    const val = Number(cashVal) || 0;
    const fixedStr = val.toFixed(15);
    const parts = fixedStr.split(".");
    const whole = parseInt(parts[0], 10);
    const decimals = parts[1] || "000000000000000";

    // Hide zero to the left of the decimal if balance is under $1.00
    const wholeHTML = whole > 0 ? `<span class="cash-whole">${whole}</span>` : "";
    return `<span class="cash-dollar">$</span>${wholeHTML}<span class="cash-point">.</span><span class="cash-decimal">${decimals}</span>`;
  }
  
  function updateTopbar() {
    const state = Store.get();
    if (state.cash === undefined) state.cash = 0;

    // Hero simulated USD cash balance with dual typography & suppressed leading zero
    if (el("stat-cash")) el("stat-cash").innerHTML = formatCashDisplay(state.cash);

    // Elden Bucks game currency in sub-row
    if (el("stat-eb")) el("stat-eb").textContent = Math.floor(Number(state.eb) || 0) + " EB";

    el("stat-diamonds").innerHTML = `${state.diamonds} <span class="hud-gem-icon"></span>`;
    el("stat-rate").textContent = "$" + Store.totalRate().toFixed(11) + "/s";
    el("player-name").textContent = state.player.name || "Traveler";

    const avatarEl = el("player-avatar");
    if (state.player.avatar && state.player.avatar.startsWith("img:")) {
      avatarEl.innerHTML = `<img src="${state.player.avatar.slice(4)}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
    } else {
      avatarEl.textContent = state.player.avatar || "🙂";
    }

    // --- Multiplier Glow & Timer ---
    const now = Date.now();
    const isBoosted = state.boostExpiry && state.boostExpiry > now;
    const heroCard = el("hero-balance-card");
    const timerBadge = el("boost-timer-badge");
    const multBtn = el("multiplier-btn");

    if (isBoosted) {
      const remainingMs = state.boostExpiry - now;
      heroCard?.classList.add("boosted");
      timerBadge?.classList.remove("hidden");

      // Format HH:MM:SS
      const hrs = Math.floor(remainingMs / 3600000);
      const mins = Math.floor((remainingMs % 3600000) / 60000);
      const secs = Math.floor((remainingMs % 60000) / 1000);
      el("boost-countdown").textContent = `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

      // Hide button if remaining time is 5 hours or more (Max limit: 6 hours)
      if (multBtn) {
        multBtn.style.display = remainingMs >= 5 * 3600000 ? "none" : "flex";
      }
    } else {
      heroCard?.classList.remove("boosted");
      timerBadge?.classList.add("hidden");
      if (multBtn) multBtn.style.display = "flex";
    }
  }

  function updateLandModal() {
    const state = Store.get();
    el("land-count").textContent = Object.keys(state.plots).length;
    el("land-rate").textContent = Store.totalRate().toFixed(11);

    // Count plots by rarity
    const counts = { common: 0, rare: 0, epic: 0, legendary: 0 };
    for (const id in state.plots) {
      const r = state.plots[id].rarity?.key || state.plots[id].rarity;
      if (counts[r] !== undefined) counts[r]++;
    }

    if (el("count-common")) el("count-common").textContent = counts.common;
    if (el("count-rare")) el("count-rare").textContent = counts.rare;
    if (el("count-epic")) el("count-epic").textContent = counts.epic;
    if (el("count-legendary")) el("count-legendary").textContent = counts.legendary;
  }
  
  async function updatePlayerInfoModal(targetPlayerData = null) {
    const state = Store.get();
    const isOtherPlayer = targetPlayerData && targetPlayerData.ownerId !== state.player.id;
    
    const name = isOtherPlayer ? (targetPlayerData.ownerName || "Traveler") : (state.player.name || "Traveler");
    const avatar = isOtherPlayer ? (targetPlayerData.avatar || "🙂") : (state.player.avatar || "🙂");

    el("info-name").textContent = name;
    
    // Avatar
    const av = el("info-avatar");
    if (avatar && avatar.startsWith("img:")) {
      av.innerHTML = `<img src="${avatar.slice(4)}">`;
    } else {
      av.textContent = avatar || "🙂";
    }

    // Only show the edit pencil on your own profile
    const editBtn = el("edit-avatar-btn");
    if (editBtn) editBtn.style.display = isOtherPlayer ? "none" : "flex";

    // Initial Rent Display
    let rentVal = isOtherPlayer ? 0 : (state.cash || 0);
    el("info-total-rent").textContent = "$" + Number(rentVal).toFixed(15);

    // Fetch and display the other player's live cloud earnings
    if (isOtherPlayer && targetPlayerData.ownerId) {
      const db = Store.getDb();
      if (db) {
        try {
          const doc = await db.collection("saves").doc(targetPlayerData.ownerId).get();
          if (doc.exists && doc.data().cash !== undefined) {
            el("info-total-rent").textContent = "$" + Number(doc.data().cash).toFixed(15);
          }
        } catch (e) {
          console.warn("[PlayerInfo] Error fetching player cash:", e);
        }
      }
    }

    // Calculate Counts from global plots
    const allPlots = (typeof Grid !== "undefined" && Grid.getAllPlots) ? Grid.getAllPlots() : state.plots;
    const targetOwnerId = isOtherPlayer ? targetPlayerData.ownerId : state.player.id;

    const counts = { common: 0, rare: 0, epic: 0, legendary: 0 };
    let total = 0;

    for (const id in allPlots) {
      if (allPlots[id].ownerId === targetOwnerId) {
        const r = allPlots[id].rarity?.key || allPlots[id].rarity;
        if (counts[r] !== undefined) counts[r]++;
        total++;
      }
    }

    el("info-total-plots").textContent = total;
    el("info-count-common").textContent = counts.common;
    el("info-count-rare").textContent = counts.rare;
    el("info-count-epic").textContent = counts.epic;
    el("info-count-legendary").textContent = counts.legendary;
  }

  // ---------------- Sign-in & Sequenced Boot ----------------
  function onSignedIn(playerData) {
    const player = playerData || Store.get()?.player || { name: "Traveler" };

    // Execute the professional load pipeline
    Bootloader.run(player, (coords) => {
      launchGame(coords);
      beginWatch();
    });
  }

  // ---------------- Location ----------------
  function startLocating() {
    if (!("geolocation" in navigator)) {
      el("locate-status").textContent = "Your device doesn't support location services.";
      return;
    }
    el("locate-status").textContent = "Locating…";
    navigator.geolocation.getCurrentPosition(
      (pos) => { launchGame(pos.coords); beginWatch(); },
      (err) => { el("locate-status").textContent = "Location denied — enable it in your browser settings and try again."; },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );
  }

  function beginWatch() {
    watchId = navigator.geolocation.watchPosition(
      (pos) => handlePosition(pos.coords),
      (err) => console.warn("watchPosition error", err),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
    );
  }

  function handlePosition(coords) {
    currentPos = { lat: coords.latitude, lon: coords.longitude };
    if (!map) return;
    
    // Move 3D Character & Sonar Pulse
    Character3D.setPlayerPosition(currentPos.lon, currentPos.lat);
    sonarMarker?.setLngLat([currentPos.lon, currentPos.lat]);
    if (typeof updateSonarRadiusPixels === "function") updateSonarRadiusPixels();
    Diamonds.setPlayerPosition(currentPos.lat, currentPos.lon);
  }
  
  // ---------------- 3D Map / Game Launch ----------------
  function launchGame(coords) {
    currentPos = { lat: coords.latitude, lon: coords.longitude };
    el("locate-screen")?.classList.add("hidden");
    el("loading-screen")?.classList.add("hidden");
    el("game-screen")?.classList.remove("hidden");

    const mbToken = ["pk.eyJ1IjoiYXJ0aXN0aWNpbnRlbnRpb256Iiwi", "YSI6ImNtdGxyZ283MDAwZTMydnEzc3B4bGpwMDgifQ.8JqJCLZ--2M0UWJXeWPWqg"].join("");
    mapboxgl.accessToken = mbToken;

    // 1. Initialize Mapbox 3D Camera (Smooth Gestures + Locked to Player)
    map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/dark-v11",
      center: [currentPos.lon, currentPos.lat],
      zoom: 18.5,
      minZoom: 15.2,   // 1 mile max zoom-out
      maxZoom: 19.6,   // Street-level max zoom-in
      pitch: 60,
      bearing: 0,
      antialias: true,
      dragPan: false,  // Map stays locked to player (cannot scroll away)
      dragRotate: true,
      touchZoomRotate: true,
    });

    // Smooth 1-finger camera orbit around player
    let isOrbiting = false;
    let lastTouchX = 0;
    const canvas = map.getCanvas();

    canvas.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) {
        isOrbiting = true;
        lastTouchX = e.touches[0].clientX;
      }
    }, { passive: true });

    canvas.addEventListener("touchmove", (e) => {
      // Only orbit if 1 finger is down (leaves 2-finger pinch-zoom totally smooth)
      if (isOrbiting && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - lastTouchX;
        lastTouchX = e.touches[0].clientX;
        map.setBearing(map.getBearing() + deltaX * 0.4);
      }
    }, { passive: true });

    canvas.addEventListener("touchend", () => { isOrbiting = false; });

    // Re-lock center strictly when gestures finish (never interrupts animations mid-flight)
    map.on("zoomend", () => {
      if (currentPos) map.setCenter([currentPos.lon, currentPos.lat]);
    });

    map.on("load", () => {
      // 2. Add True 3D Extruded Buildings
      const layers = map.getStyle().layers;
      const labelLayerId = layers.find(l => l.type === "symbol" && l.layout && l.layout["text-field"])?.id;

      map.addLayer({
        id: "3d-buildings",
        source: "composite",
        "source-layer": "building",
        filter: ["==", "extrude", "true"],
        type: "fill-extrusion",
        minzoom: 15,
        paint: {
          "fill-extrusion-color": "#182232",
          "fill-extrusion-height": ["get", "height"],
          "fill-extrusion-base": ["get", "min_height"],
          "fill-extrusion-opacity": 0.85,
        },
      }, labelLayerId);

      // 3. Mount 3D Animated Character
      Character3D.init(map, currentPos.lon, currentPos.lat);
      
      // 3.5. Mount 3D Isometric Sonar Pulse Radius (Locked to Real Meters)
      const sonarEl = document.createElement("div");
      sonarEl.className = "sonar-ground-anchor";
      sonarEl.innerHTML = `
        <div class="sonar-boundary-ring"></div>
        <div class="sonar-wave-ring wave-1"></div>
        <div class="sonar-wave-ring wave-2"></div>
      `;

      // Helper to calculate exact screen pixels for real-world meters
      updateSonarRadiusPixels = function() {
        if (!currentPos || !map) return;
        const meters = Number(CONFIG.DIAMOND_COLLECT_RADIUS_METERS) || 100;
        const lat = currentPos.lat;
        const zoom = map.getZoom();
        // Web Mercator ground resolution at current latitude & zoom
        const metersPerPx = (40075016.686 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom + 8);
        const pixelRadius = meters / metersPerPx;
        const diameter = Math.round(pixelRadius * 2);

        sonarEl.style.width = `${diameter}px`;
        sonarEl.style.height = `${diameter}px`;
      };

      sonarMarker = new mapboxgl.Marker({
        element: sonarEl,
        anchor: "center",
        rotationAlignment: "map",
        pitchAlignment: "map",
      })
        .setLngLat([currentPos.lon, currentPos.lat])
        .addTo(map);

      updateSonarRadiusPixels();
      map.on("zoom", updateSonarRadiusPixels);
      map.on("pitch", updateSonarRadiusPixels);
      
      // 4. Initialize Core Game Subsystems
      Grid.init(map, {
        onBuyAttempt: (success, rarity) => {
          if (success) {
            showToast(`Claimed a ${rarity.label} plot!`);
            updateTopbar();
            updateLandModal();
          } else {
            showToast(`You need ${CONFIG.PLOT_COST_EB} EB to claim this tile.`);
          }
        },
      });
      Grid.render();

      Diamonds.init(map, {
        onCollect: () => { updateTopbar(); showToast("Found a diamond! ◆ +1"); },
        onDenied: () => showToast("Too far — walk closer to collect it."),
      });
      Diamonds.setPlayerPosition(currentPos.lat, currentPos.lon);
    });

    Wheel.init();
    startIncomeLoop();
    wireUI();
  }

  function startIncomeLoop() {
    const earned = Store.applyOfflineProgress();
    if (earned > 0.000000000000001) {
      showToast(`Welcome back — earned $${earned.toFixed(8)} while away.`);
    }
    updateTopbar();

    // Ticks every 0.5s (500ms), adding passive USD cash income per tick
    setInterval(() => {
      const state = Store.get();
      if (state.cash === undefined) state.cash = 0;
      const ratePerHalfSec = Store.totalRate() * 0.5;
      state.cash += ratePerHalfSec;
      state.lastTick = Date.now();
      Store.save();
      updateTopbar();
    }, 500);
  }

  // ---------------- UI wiring ----------------
  function wireUI() {
    window.addEventListener("openPlayerInfo", (e) => {       const cluster = e.detail?.cluster;       updatePlayerInfoModal(cluster ? cluster[0] : null);       openModal("player-info-modal");     });
    // --- 3D Character Wardrobe Selector ---
    function renderWardrobe() {
      const grid = el("wardrobe-grid");
      if (!grid) return;
      grid.innerHTML = "";

      const state = Store.get();
      const currentModelId = state?.player?.model3d || "soldier";
      const characters = CONFIG.AVAILABLE_CHARACTERS || [];

      characters.forEach((char) => {
        const isSelected = char.id === currentModelId;
        const card = document.createElement("div");
        card.className = "wardrobe-card" + (isSelected ? " selected" : "");
        card.innerHTML = `
          <span class="char-icon">${char.icon || "👤"}</span>
          <span class="char-name">${char.name}</span>
          <span class="char-status">${isSelected ? "EQUIPPED" : "Equip"}</span>
        `;

        card.addEventListener("click", () => {
          if (typeof Character3D !== "undefined" && Character3D.changeCharacter) {
            Character3D.changeCharacter(char.id);
            showToast(`Equipped ${char.name}!`);
          }
          closeModal("wardrobe-modal");
          updatePlayerInfoModal();
        });

        grid.appendChild(card);
      });
    }

    // Open Wardrobe on Pencil Tap
    el("edit-avatar-btn")?.addEventListener("click", () => {
      renderWardrobe();
      openModal("wardrobe-modal");
    });
    // --- Diamond Extractor Dynamic Level Math (2-min base, up to 50 gems) ---
    function getExtractorStats(level = 1) {
      const baseInterval = CONFIG.EXTRACTOR_INTERVAL_MS || 120000; // 2 mins (120,000ms)
      const timeUpgrades = Math.floor((level - 1) / 2);
      const storageUpgrades = Math.floor(level / 2);

      // 0.0001% safe time reduction per time upgrade
      const interval = baseInterval * Math.pow(1 - 0.000001, timeUpgrades);
      const maxStored = (CONFIG.EXTRACTOR_MAX_STORED || 50) + storageUpgrades;
      const nextCost = level * 1.0; // $1.00, $2.00, $3.00...
      const nextIsCapacity = level % 2 === 1;

      return { interval, maxStored, nextCost, nextIsCapacity };
    }

    function checkExtractorTick() {
      const state = Store.get();
      if (!state.extractor) state.extractor = { built: false, level: 1, lastHarvest: Date.now(), stored: 0 };
      if (!state.extractor.built) return;

      const lvl = state.extractor.level || 1;
      const { interval, maxStored, nextCost, nextIsCapacity } = getExtractorStats(lvl);

      const now = Date.now();
      const timeSince = now - state.extractor.lastHarvest;
      const readyCount = Math.floor(timeSince / interval);

      if (readyCount > 0 && state.extractor.stored < maxStored) {
        state.extractor.stored = Math.min(maxStored, state.extractor.stored + readyCount);
        state.extractor.lastHarvest = now - (timeSince % interval);
        Store.save();
      }

      // Live UI Updates
      const remainingMs = Math.max(0, interval - (now - state.extractor.lastHarvest));
      const hrs = Math.floor(remainingMs / 3600000);
      const mins = Math.floor((remainingMs % 3600000) / 60000);
      const secs = Math.floor((remainingMs % 60000) / 1000);

      if (el("extractor-lvl-badge")) el("extractor-lvl-badge").textContent = `Level ${lvl}`;
      if (el("extractor-next-timer")) el("extractor-next-timer").textContent = `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
      if (el("extractor-stored-count")) el("extractor-stored-count").innerHTML = `${state.extractor.stored} / ${maxStored} <span class="hud-gem-icon"></span>`;
      if (el("extractor-next-perk")) el("extractor-next-perk").textContent = nextIsCapacity ? "Next: +1 Max Diamond Capacity" : "Next: -0.0001% Mining Time";
      if (el("upgrade-extractor-btn")) el("upgrade-extractor-btn").textContent = `Upgrade ($${nextCost.toFixed(2)})`;
      if (el("collect-extractor-btn")) {
        el("collect-extractor-btn").innerHTML = `Collect All (${state.extractor.stored} <span class="hud-gem-icon"></span>)`;
        el("collect-extractor-btn").disabled = state.extractor.stored === 0;
      }
    }

    function openExtractorModal() {
      const state = Store.get();
      if (!state.extractor) state.extractor = { built: false, lastHarvest: Date.now(), stored: 0 };

      if (!state.extractor.built) {
        el("extractor-unbuilt-view")?.classList.remove("hidden");
        el("extractor-active-view")?.classList.add("hidden");
      } else {
        el("extractor-unbuilt-view")?.classList.add("hidden");
        el("extractor-active-view")?.classList.remove("hidden");
        checkExtractorTick();
      }
      openModal("extractor-modal");
    }

    window.addEventListener("openExtractorModal", openExtractorModal);

    // Upgrade Extractor Button (Spends Cash Balance)
    el("upgrade-extractor-btn")?.addEventListener("click", () => {
      const state = Store.get();
      if (!state.extractor || !state.extractor.built) return;

      const lvl = state.extractor.level || 1;
      const { nextCost } = getExtractorStats(lvl);

      if ((state.cash || 0) < nextCost) {
        showToast(`You need $${nextCost.toFixed(2)} in Cash Balance to upgrade.`);
        return;
      }

      state.cash -= nextCost;
      state.extractor.level = lvl + 1;
      Store.save();
      updateTopbar();
      showToast(`⚡ Extractor Upgraded to Level ${lvl + 1}!`);
      checkExtractorTick();
    });

    // Build Extractor Button
    el("build-extractor-btn")?.addEventListener("click", () => {
      const state = Store.get();
      const cost = CONFIG.EXTRACTOR_BUILD_COST_EB || 50;
      if (state.eb < cost) {
        showToast(`You need ${cost} EB to construct the Extractor.`);
        return;
      }
      state.eb -= cost;
      state.extractor.built = true;
      state.extractor.lastHarvest = Date.now();
      state.extractor.stored = 0;
      Store.save();
      updateTopbar();
      showToast("💎 Diamond Extractor Constructed!");
      openExtractorModal();
    });

    // Collect Diamonds Button
    el("collect-extractor-btn")?.addEventListener("click", () => {
      const state = Store.get();
      if (!state.extractor || state.extractor.stored <= 0) return;
      const count = state.extractor.stored;
      state.diamonds += count;
      state.extractor.stored = 0;
      Store.save();
      updateTopbar();
      showToast(`💎 Collected ${count} Diamond${count > 1 ? "s" : ""} from Extractor!`);
      checkExtractorTick();
    });

    // Check extractor every 2 seconds
    setInterval(checkExtractorTick, 2000);
    // --- Multiplier Button Wiring ---
    const multBtn = el("multiplier-btn");
    const activateBoostBtn = el("activate-boost-btn");

    // 0.05% chance for 50X (1 in 2000), otherwise 30X
    function getCurrentMultiplier() {
      const isLucky50X = Math.random() < 0.0005;
      return isLucky50X ? 50 : 30;
    }

    let activeRollMultiplier = 30;

    if (multBtn) {
      multBtn.addEventListener("click", () => {
        activeRollMultiplier = getCurrentMultiplier();
        el("mult-label").textContent = activeRollMultiplier + "X";
        el("booster-modal-title").textContent = `Activate ${activeRollMultiplier}X Boost`;
        el("modal-mult-rate").textContent = `${activeRollMultiplier}X Income`;
        openModal("booster-modal");
      });
    }

    if (activateBoostBtn) {
      activateBoostBtn.addEventListener("click", () => {
        const state = Store.get();
        const now = Date.now();
        const oneHour = 3600 * 1000;
        const sixHours = 6 * 3600 * 1000;

        // Stack time up to 6 hours max
        const currentRemaining = Math.max(0, (state.boostExpiry || 0) - now);
        const newRemaining = Math.min(sixHours, currentRemaining + oneHour);

        state.boostExpiry = now + newRemaining;
        state.boostMultiplier = activeRollMultiplier;
        Store.save();

        closeModal("booster-modal");
        updateTopbar();
        showToast(`⚡ ${activeRollMultiplier}X Multiplier Activated! (+1 Hr)`);
      });
    }
    // --- Floating +2 EB Boost Loop ---
    const boostBtn = el("boost-btn");
    let boostHideTimer = null;

    function scheduleBoost() {
      // Appears randomly between 55 and 115 seconds
      const delay = 55000 + Math.random() * 60000;
      setTimeout(() => {
        if (!boostBtn) return;
        boostBtn.classList.remove("hidden");

        // Stays on screen for 16 seconds before vanishing
        boostHideTimer = setTimeout(() => {
          boostBtn.classList.add("hidden");
          scheduleBoost();
        }, 16000);
      }, delay);
    }

    if (boostBtn) {
      boostBtn.addEventListener("click", () => {
        clearTimeout(boostHideTimer);
        boostBtn.classList.add("hidden");

        const state = Store.get();
        state.eb += 2;
        Store.save();
        updateTopbar();
        showToast("⚡ Claimed +2.00 EB Boost!");

        // Schedule next appearance
        scheduleBoost();
      });

      // Start initial timer
      scheduleBoost();
    }

    // --- Smooth BUY LAND 2D Camera Transition ---
    const buyLandBtn = el("buy-land-mode-btn");
    const exitBuyBtn = el("exit-buy-mode-btn");
    const buyBanner = el("buy-mode-banner");

    function enterBuyLandMode() {
      if (!map || !currentPos) return;
      buyBanner?.classList.remove("hidden");
      Grid.setBuyMode(true, currentPos);

      // Smooth cinematic swoosh to top-down 2D
      map.flyTo({
        center: [currentPos.lon, currentPos.lat],
        pitch: 0,       // Flat 2D top-down view
        bearing: 0,     // Aligns to North
        zoom: 19.2,
        duration: 1000,
        essential: true,
      });
    }

    function exitBuyLandMode() {
      if (!map || !currentPos) return;
      buyBanner?.classList.add("hidden");
      Grid.setBuyMode(false);

      // Smooth return to 60° 3D Isometric View
      map.flyTo({
        center: [currentPos.lon, currentPos.lat],
        pitch: 60,      // 60° 3D Isometric View
        zoom: 18.5,
        duration: 1000,
        essential: true,
      });
    }

    buyLandBtn?.addEventListener("click", enterBuyLandMode);
    exitBuyBtn?.addEventListener("click", exitBuyLandMode);

    // Reset Camera to True North & Default Zoom Level
    el("recenter-btn")?.addEventListener("click", () => {
      if (currentPos && map) {
        map.flyTo({
          center: [currentPos.lon, currentPos.lat],
          bearing: 0,      // Snaps camera back to True North
          pitch: 60,       // Resets to 3D Isometric View
          zoom: 18.5,      // Returns to default sweetspot zoom
          duration: 900,
          essential: true,
        });
      }
    });
    
    // Tap Balance or Profile Chip to open Player Info Modal
    function openPlayerInfo() {
      updatePlayerInfoModal();
      openModal("player-info-modal");
    }
    el("hero-balance-card").addEventListener("click", openPlayerInfo);
    document.querySelector(".player-chip")?.addEventListener("click", openPlayerInfo);

    el("earn-btn").addEventListener("click", () => {
      // Safety unlock in case modal was closed mid-spin
      const spinBtn = el("spin-btn");
      if (spinBtn && !el("wheel-result").textContent.includes("Spinning")) {
        spinBtn.disabled = false;
      }
      openModal("wheel-modal");
    });
    el("land-btn").addEventListener("click", () => { updateLandModal(); openModal("land-modal"); });
    el("menu-btn").addEventListener("click", () => openModal("menu-modal"));

    document.querySelectorAll("[data-close]").forEach(btn => {
      btn.addEventListener("click", () => closeModal(btn.dataset.close));
    });
    document.querySelectorAll(".modal").forEach(modal => {
      modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.add("hidden"); });
    });

    el("spin-btn").addEventListener("click", () => {
      const state = Store.get();
      const cost = CONFIG.SPIN_COST_DIAMONDS || 1;

      if ((Number(state.diamonds) || 0) < cost) {
        showToast("Not enough diamonds — go find some!");
        return;
      }

      state.diamonds = Math.max(0, (Number(state.diamonds) || 0) - cost);
      Store.save();
      updateTopbar();
      el("spin-btn").disabled = true;
      el("wheel-result").textContent = "Spinning...";

      Wheel.spin((slice) => {
        const s = Store.get();
        if (!slice) return;

        if (slice.type === "diamond") {
          s.diamonds = (Number(s.diamonds) || 0) + 1;
          el("wheel-result").textContent = "Your diamond found its way back to you. (◆ +1)";
          showToast("💎 +1 Diamond Refunded!");
        } else if (slice.type === "miss") {
          el("wheel-result").textContent = "Better luck next time! (No reward)";
          showToast("🚫 Nothing this time — keep searching!");
        } else {
          const winAmount = Number(slice.amount) || 0;
          s.eb = (Number(s.eb) || 0) + winAmount;
          el("wheel-result").textContent = `🎉 You won ${winAmount} EB!`;
          showToast(`🎉 Won +${winAmount} Elden Bucks!`);
        }

        Store.save();
        updateTopbar();
        el("spin-btn").disabled = false;
      });
    });

    el("reset-btn").addEventListener("click", () => {
      if (confirm("This wipes all Elden Earth progress on this device. Continue?")) {
        Store.reset();
        location.reload();
      }
    });
  }

  // ---------------- Boot ----------------
  document.addEventListener("DOMContentLoaded", () => {
    Store.load();
    Auth.init(onSignedIn);
    el("locate-btn")?.addEventListener("click", startLocating);
  });
})();
