// ============================================================
// Elden Earth — main
// Wires sign-in -> location permission -> map -> game loop.
// ============================================================
(() => {
  let map, playerMarker, collectionCircle, pulseWave1, pulseWave2, watchId;
  let currentPos = null;
  let toastTimer = null;

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

  function updateTopbar() {
    const state = Store.get();
    if (state.cash === undefined) state.cash = 0;

    // Hero simulated USD cash balance (15 decimals)
    if (el("stat-cash")) el("stat-cash").textContent = "$" + state.cash.toFixed(15);

    // Elden Bucks game currency in sub-row
    if (el("stat-eb")) el("stat-eb").textContent = Math.floor(Number(state.eb) || 0) + " EB";

    el("stat-diamonds").textContent = state.diamonds + " ◆";
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
  
  function updatePlayerInfoModal() {
    const state = Store.get();
    el("info-name").textContent = state.player.name || "Traveler";
    
    // Avatar
    const av = el("info-avatar");
    if (state.player.avatar && state.player.avatar.startsWith("img:")) {
      av.innerHTML = `<img src="${state.player.avatar.slice(4)}">`;
    } else {
      av.textContent = state.player.avatar || "🙂";
    }

    // Total Rent
    el("info-total-rent").textContent = "$" + (state.cash || 0).toFixed(15);

    // Counts
    const counts = { common: 0, rare: 0, epic: 0, legendary: 0 };
    let total = 0;
    for (const id in state.plots) {
      const r = state.plots[id].rarity?.key || state.plots[id].rarity;
      if (counts[r] !== undefined) counts[r]++;
      total++;
    }

    el("info-total-plots").textContent = total;
    el("info-count-common").textContent = counts.common;
    el("info-count-rare").textContent = counts.rare;
    el("info-count-epic").textContent = counts.epic;
    el("info-count-legendary").textContent = counts.legendary;
  }

  // ---------------- Sign-in ----------------
  function onSignedIn() {
    updateTopbar();
    el("signin-screen").classList.add("hidden");
    el("locate-screen").classList.remove("hidden");
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
    playerMarker.setLatLng([currentPos.lat, currentPos.lon]);
    collectionCircle.setLatLng([currentPos.lat, currentPos.lon]);
    pulseWave1?.setLatLng([currentPos.lat, currentPos.lon]);
    pulseWave2?.setLatLng([currentPos.lat, currentPos.lon]);
    Diamonds.setPlayerPosition(currentPos.lat, currentPos.lon);
  }

  // ---------------- Map / game ----------------
  function launchGame(coords) {
    currentPos = { lat: coords.latitude, lon: coords.longitude };
    el("locate-screen").classList.add("hidden");
    el("game-screen").classList.remove("hidden");

    map = L.map("map", { zoomControl: false, attributionControl: true })
      .setView([currentPos.lat, currentPos.lon], 19);

    const mbToken = ["pk.eyJ1IjoiYXJ0aXN0aWNpbnRlbnRpb256Iiwi", "YSI6ImNtdGxyZ283MDAwZTMydnEzc3B4bGpwMDgifQ.8JqJCLZ--2M0UWJXeWPWqg"].join("");

    L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}@2x?access_token=${mbToken}`, {
      attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a>',
      tileSize: 512,
      zoomOffset: -1,
      maxZoom: 22,
      maxNativeZoom: 22,
    }).addTo(map);

    playerMarker = L.marker([currentPos.lat, currentPos.lon], {
      icon: L.divIcon({ className: "", html: '<div class="player-dot"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }),
      zIndexOffset: 1000,
    }).addTo(map);

    // Outer Static Boundary Circle
    collectionCircle = L.circle([currentPos.lat, currentPos.lon], {
      radius: CONFIG.DIAMOND_COLLECT_RADIUS_METERS,
      color: "#4fd6c4", weight: 1.5, fillColor: "#4fd6c4", fillOpacity: 0.04, dashArray: "4 6",
    }).addTo(map);

    // Continuous Expanding Radar Wave 1
    pulseWave1 = L.circle([currentPos.lat, currentPos.lon], {
      radius: CONFIG.DIAMOND_COLLECT_RADIUS_METERS,
      color: "#4fd6c4", weight: 2, fillColor: "#4fd6c4",
      className: "radar-wave wave-1",
    }).addTo(map);

    // Continuous Expanding Radar Wave 2 (Staggered offset)
    pulseWave2 = L.circle([currentPos.lat, currentPos.lon], {
      radius: CONFIG.DIAMOND_COLLECT_RADIUS_METERS,
      color: "#4fd6c4", weight: 2, fillColor: "#4fd6c4",
      className: "radar-wave wave-2",
    }).addTo(map);

    Diamonds.init(map, {
      onCollect: () => { updateTopbar(); showToast("Found a diamond! ◆ +1"); },
      onDenied: () => showToast("Too far — walk closer to collect it."),
    });
    Diamonds.setPlayerPosition(currentPos.lat, currentPos.lon);

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
    window.addEventListener("openPlayerInfo", openPlayerInfo);
    // --- Diamond Extractor Logic ---
    function checkExtractorTick() {
      const state = Store.get();
      if (!state.extractor) state.extractor = { built: false, lastHarvest: Date.now(), stored: 0 };
      if (!state.extractor.built) return;

      const now = Date.now();
      const interval = CONFIG.EXTRACTOR_INTERVAL_MS || 28800000;
      const maxStored = CONFIG.EXTRACTOR_MAX_STORED || 3;
      const timeSince = now - state.extractor.lastHarvest;
      const readyCount = Math.floor(timeSince / interval);

      if (readyCount > 0 && state.extractor.stored < maxStored) {
        state.extractor.stored = Math.min(maxStored, state.extractor.stored + readyCount);
        state.extractor.lastHarvest = now - (timeSince % interval);
        Store.save();
      }

      // Update timer if modal is open
      const remainingMs = Math.max(0, interval - (now - state.extractor.lastHarvest));
      const hrs = Math.floor(remainingMs / 3600000);
      const mins = Math.floor((remainingMs % 3600000) / 60000);
      const secs = Math.floor((remainingMs % 60000) / 1000);

      if (el("extractor-next-timer")) {
        el("extractor-next-timer").textContent = `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
      }
      if (el("extractor-stored-count")) {
        el("extractor-stored-count").textContent = `${state.extractor.stored} / ${maxStored} ◆`;
      }
      if (el("collect-extractor-btn")) {
        el("collect-extractor-btn").textContent = `Collect All (${state.extractor.stored} ◆)`;
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

    el("recenter-btn").addEventListener("click", () => {
      if (currentPos) map.setView([currentPos.lat, currentPos.lon], Math.max(map.getZoom(), 19));
    });
    
    // Tap Balance or Profile Chip to open Player Info Modal
    function openPlayerInfo() {
      updatePlayerInfoModal();
      openModal("player-info-modal");
    }
    el("hero-balance-card").addEventListener("click", openPlayerInfo);
    document.querySelector(".player-chip")?.addEventListener("click", openPlayerInfo);

    el("earn-btn").addEventListener("click", () => openModal("wheel-modal"));
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
    el("locate-btn").addEventListener("click", startLocating);
  });
})();
