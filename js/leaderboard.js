// ============================================================
// Elden Earth — Leaderboards & Local Mayorship System
// Tracks Top Landlords, Rent Earners, City Mayors & 2% Dividends
// ============================================================
const Leaderboard = (() => {
  let modal = null;
  let currentTab = "plots"; // "plots" | "rent" | "mayors"

  // Helper to aggregate leaderboard data from global plots & saves
  async function fetchRankings() {
    const allPlots = (typeof Grid !== "undefined" && Grid.getAllPlots) ? Grid.getAllPlots() : {};
    const state = Store.get();
    const db = Store.getDb();

    // 1. Group plots by owner & count by city
    const playerStats = {}; // ownerId -> { id, name, avatar, plotsCount, cities: { cityName: count } }
    const cityMayors = {};  // cityName -> { topOwnerId, maxPlots, topPlayerName, avatar }

    for (const tid in allPlots) {
      const p = allPlots[tid];
      const oid = p.ownerId || "unknown";
      if (!playerStats[oid]) {
        playerStats[oid] = {
          id: oid,
          name: p.ownerName || "Traveler",
          avatar: p.avatar || "🙂",
          plotsCount: 0,
          cities: {}
        };
      }
      playerStats[oid].plotsCount++;

      // City tracking
      const city = p.city || "Phoenix, AZ";
      playerStats[oid].cities[city] = (playerStats[oid].cities[city] || 0) + 1;
    }

    // Always ensure current player is represented even if 0 plots
    if (state.player?.id && !playerStats[state.player.id]) {
      playerStats[state.player.id] = {
        id: state.player.id,
        name: state.player.name || "Traveler",
        avatar: state.player.avatar || "🙂",
        plotsCount: Object.keys(state.plots || {}).length,
        cities: {}
      };
    }

    // 2. Determine Mayors per city
    const cityCounts = {}; // city -> { ownerId -> count }
    for (const oid in playerStats) {
      const p = playerStats[oid];
      for (const c in p.cities) {
        if (!cityCounts[c]) cityCounts[c] = {};
        cityCounts[c][oid] = p.cities[c];
      }
    }

    for (const c in cityCounts) {
      let maxP = 0;
      let topOid = null;
      for (const oid in cityCounts[c]) {
        if (cityCounts[c][oid] > maxP) {
          maxP = cityCounts[c][oid];
          topOid = oid;
        }
      }
      if (topOid) {
        cityMayors[c] = {
          city: c,
          ownerId: topOid,
          plots: maxP,
          name: playerStats[topOid]?.name || "Traveler",
          avatar: playerStats[topOid]?.avatar || "🙂"
        };
      }
    }

    // 3. Fetch cash balances for rent rankings from Firestore if available
    const playerArray = Object.values(playerStats);
    if (db) {
      try {
        const snap = await db.collection("saves").limit(50).get();
        snap.forEach(doc => {
          const d = doc.data();
          const target = playerArray.find(p => p.id === doc.id);
          if (target) {
            target.cash = d.cash || 0;
          } else if (d.player) {
            playerArray.push({
              id: doc.id,
              name: d.player.name || "Traveler",
              avatar: d.player.avatar || "🙂",
              plotsCount: Object.keys(d.plots || {}).length,
              cash: d.cash || 0,
              cities: {}
            });
          }
        });
      } catch (e) {
        console.warn("[Leaderboard] Saves query notice:", e);
      }
    }

    // Ensure local player cash is current
    const me = playerArray.find(p => p.id === state.player?.id);
    if (me) me.cash = state.cash || 0;

    return { players: playerArray, mayors: Object.values(cityMayors) };
  }

  // Check and award 2% dividend if a mayor exists for the purchased plot's city
  async function awardMayorshipDividend(cityName, buyerId, plotCostEB) {
    if (!cityName) return;
    const db = Store.getDb();
    const state = Store.get();
    const { mayors } = await fetchRankings();
    const mayor = mayors.find(m => m.city === cityName);

    if (!mayor || mayor.ownerId === buyerId) return; // No self-dividend

    const dividendEB = Math.max(1, Math.round(plotCostEB * 0.02)); // 2% dividend = 2 EB

    // If local player is the mayor, award directly!
    if (mayor.ownerId === state.player.id) {
      state.eb = (Number(state.eb) || 0) + dividendEB;
      Store.save();
      if (typeof showToast === "function") {
        showToast(`👑 Mayorship Dividend! +${dividendEB} EB collected from ${cityName}!`);
      }
    }

    // Broadcast dividend event to Live Feed
    if (typeof Feed !== "undefined") {
      Feed.broadcast("dividend", {
        mayorName: mayor.name,
        city: cityName,
        amount: dividendEB
      });
    }
  }

  function render(data) {
    const listEl = document.getElementById("leaderboard-list");
    if (!listEl) return;
    listEl.innerHTML = "";

    const state = Store.get();
    const myId = state.player?.id;

    if (currentTab === "plots") {
      // Sort by plots descending
      const sorted = [...data.players].sort((a, b) => (b.plotsCount || 0) - (a.plotsCount || 0));
      sorted.forEach((p, idx) => {
        const isSelf = p.id === myId;
        const rankMedal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`;
        const row = document.createElement("div");
        row.className = "lb-row" + (isSelf ? " self-row" : "");
        row.innerHTML = `
          <div class="lb-rank">${rankMedal}</div>
          <div class="lb-avatar">${renderAvatar(p.avatar)}</div>
          <div class="lb-info">
            <span class="lb-name">${p.name} ${isSelf ? "<em>(You)</em>" : ""}</span>
            <span class="lb-sub">${p.plotsCount} Plots Claimed</span>
          </div>
          <div class="lb-metric">${p.plotsCount} <span class="lb-unit">Plots</span></div>
        `;
        listEl.appendChild(row);
      });
    } else if (currentTab === "rent") {
      // Sort by total cash accrued descending
      const sorted = [...data.players].sort((a, b) => (b.cash || 0) - (a.cash || 0));
      sorted.forEach((p, idx) => {
        const isSelf = p.id === myId;
        const rankMedal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`;
        const row = document.createElement("div");
        row.className = "lb-row" + (isSelf ? " self-row" : "");
        row.innerHTML = `
          <div class="lb-rank">${rankMedal}</div>
          <div class="lb-avatar">${renderAvatar(p.avatar)}</div>
          <div class="lb-info">
            <span class="lb-name">${p.name} ${isSelf ? "<em>(You)</em>" : ""}</span>
            <span class="lb-sub">Total Passive Rent</span>
          </div>
          <div class="lb-metric gold">$${(Number(p.cash) || 0).toFixed(6)}</div>
        `;
        listEl.appendChild(row);
      });
    } else if (currentTab === "mayors") {
      // Active Mayors list
      if (data.mayors.length === 0) {
        listEl.innerHTML = `<div class="feed-empty-msg">No Mayors established yet. Claim plots to conquer a city!</div>`;
        return;
      }
      data.mayors.forEach((m) => {
        const isSelf = m.ownerId === myId;
        const row = document.createElement("div");
        row.className = "lb-row mayor-row" + (isSelf ? " self-row" : "");
        row.innerHTML = `
          <div class="lb-rank">👑</div>
          <div class="lb-avatar mayor-crown-wrap">${renderAvatar(m.avatar)}<span class="crown-icon">👑</span></div>
          <div class="lb-info">
            <span class="lb-name">${m.name} ${isSelf ? "<em>(You)</em>" : ""}</span>
            <span class="lb-sub">Mayor of <strong>${m.city}</strong></span>
          </div>
          <div class="lb-metric teal">2% <span class="lb-unit">Dividend</span></div>
        `;
        listEl.appendChild(row);
      });
    }
  }

  function renderAvatar(avatar) {
    if (avatar && avatar.startsWith("img:")) {
      return `<img src="${avatar.slice(4)}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
    }
    return `<span>${avatar || "🙂"}</span>`;
  }

  async function open() {
    if (!modal) modal = document.getElementById("leaderboard-modal");
    if (modal) modal.classList.remove("hidden");
    const data = await fetchRankings();
    render(data);
  }

  function init() {
    modal = document.getElementById("leaderboard-modal");
    document.getElementById("leaderboard-btn")?.addEventListener("click", open);

    // Tab switching
    const tabs = document.querySelectorAll(".lb-tab-btn");
    tabs.forEach(tab => {
      tab.addEventListener("click", async () => {
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        currentTab = tab.dataset.tab;
        const data = await fetchRankings();
        render(data);
      });
    });
  }

  return { init, open, fetchRankings, awardMayorshipDividend };
})();
