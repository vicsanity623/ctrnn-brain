// ============================================================
// Elden Earth — main
// Wires sign-in -> location permission -> map -> game loop.
// ============================================================
(() => {
  let map, playerMarker, collectionCircle, watchId;
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
    el("stat-eb").textContent = state.eb.toFixed(8);
    el("stat-diamonds").textContent = state.diamonds + " ◆";
    el("stat-rate").textContent = Store.totalRate().toFixed(8) + "/s";
    el("player-name").textContent = state.player.name || "Traveler";

    const avatarEl = el("player-avatar");
    if (state.player.avatar && state.player.avatar.startsWith("img:")) {
      avatarEl.innerHTML = `<img src="${state.player.avatar.slice(4)}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
    } else {
      avatarEl.textContent = state.player.avatar || "🙂";
    }
  }

  function updateLandModal() {
    const state = Store.get();
    el("land-count").textContent = Object.keys(state.plots).length;
    el("land-rate").textContent = Store.totalRate().toFixed(8);
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
    Diamonds.setPlayerPosition(currentPos.lat, currentPos.lon);
  }

  // ---------------- Map / game ----------------
  function launchGame(coords) {
    currentPos = { lat: coords.latitude, lon: coords.longitude };
    el("locate-screen").classList.add("hidden");
    el("game-screen").classList.remove("hidden");

    map = L.map("map", { zoomControl: false, attributionControl: true })
      .setView([currentPos.lat, currentPos.lon], 19);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxNativeZoom: 19,
      maxZoom: 22,
      subdomains: "abcd",
    }).addTo(map);

    playerMarker = L.marker([currentPos.lat, currentPos.lon], {
      icon: L.divIcon({ className: "", html: '<div class="player-dot"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }),
      zIndexOffset: 1000,
    }).addTo(map);

    collectionCircle = L.circle([currentPos.lat, currentPos.lon], {
      radius: CONFIG.DIAMOND_COLLECT_RADIUS_METERS,
      color: "#4fd6c4", weight: 1.5, fillColor: "#4fd6c4", fillOpacity: 0.08, dashArray: "4 6",
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
    if (earned > 0.00000001) {
      showToast(`Welcome back — earned ${earned.toFixed(8)} EB while away.`);
    }
    updateTopbar();

    setInterval(() => {
      const state = Store.get();
      state.eb += Store.totalRate();
      state.lastTick = Date.now();
      Store.save();
      updateTopbar();
    }, 1000);
  }

  // ---------------- UI wiring ----------------
  function wireUI() {
    el("recenter-btn").addEventListener("click", () => {
      if (currentPos) map.setView([currentPos.lat, currentPos.lon], Math.max(map.getZoom(), 19));
    });

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
      if (state.diamonds < CONFIG.SPIN_COST_DIAMONDS) {
        showToast("Not enough diamonds — go find some!");
        return;
      }
      state.diamonds -= CONFIG.SPIN_COST_DIAMONDS;
      Store.save();
      updateTopbar();
      el("spin-btn").disabled = true;
      el("wheel-result").textContent = "";

      Wheel.spin((slice) => {
        const s = Store.get();
        if (slice.type === "diamond") {
          s.diamonds += 1;
          el("wheel-result").textContent = "Your diamond found its way back to you.";
        } else {
          s.eb += slice.amount;
          el("wheel-result").textContent = `You won ${slice.amount} EB!`;
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
