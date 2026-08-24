// ============================================================================
// IDLE / AFK TRAINING JOURNEYS ENGINE (journey.js)
// ============================================================================

var selectedExpeditionTier = null;

// --- OPEN / CLOSE TRAINING MODAL ---
function openJourneyModal() {
    renderJourneyView();
    const modal = document.getElementById('journey-modal');
    const content = document.getElementById('journey-content');
    if (!modal || !content) return;
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        content.classList.remove('scale-95');
        content.classList.add('scale-100');
    }, 10);
    if (navigator.vibrate) navigator.vibrate(20);
}

function closeJourneyModal() {
    const modal = document.getElementById('journey-modal');
    const content = document.getElementById('journey-content');
    if (!modal || !content) return;
    modal.classList.add('opacity-0');
    content.classList.remove('scale-100');
    content.classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
        selectedExpeditionTier = null;
    }, 300);
}

// --- RENDER MAIN JOURNEY VIEW ---
function renderJourneyView() {
    const active = gameState.activeJourney;
    const activeBox = document.getElementById('journey-active-box');
    const tiersBox = document.getElementById('journey-tiers-box');
    const rosterBox = document.getElementById('journey-roster-box');

    if (!activeBox || !tiersBox || !rosterBox) return;

    // 1. If a journey is currently active
    if (active && active.endTime) {
        tiersBox.classList.add('hidden');
        rosterBox.classList.add('hidden');
        activeBox.classList.remove('hidden');
        updateActiveJourneyDisplay();
        return;
    }

    // 2. If selecting a Pokemon for an expedition
    activeBox.classList.add('hidden');
    if (selectedExpeditionTier !== null) {
        tiersBox.classList.add('hidden');
        rosterBox.classList.remove('hidden');
        renderJourneyRosterSelect();
    } else {
        // 3. Selecting a Tier
        rosterBox.classList.add('hidden');
        tiersBox.classList.remove('hidden');
        renderExpeditionTiers();
    }
}

// --- RENDER EXPEDITION TIERS ---
function renderExpeditionTiers() {
    const list = document.getElementById('journey-tier-list');
    if (!list) return;
    list.innerHTML = '';

    EXPEDITION_TIERS.forEach((tier, index) => {
        list.innerHTML += `
            <div onclick="selectJourneyTier(${index})" class="flex items-center justify-between p-3 bg-gray-800/90 hover:bg-purple-900/40 border border-gray-700 hover:border-purple-500 rounded-xl cursor-pointer active:scale-95 transition-all shadow">
                <div class="flex items-center gap-3">
                    <span class="text-3xl">${tier.icon}</span>
                    <div class="text-left">
                        <h4 class="font-bold text-sm text-white">${tier.name}</h4>
                        <p class="text-[10px] text-gray-400">Duration: <span class="text-yellow-400 font-semibold">${tier.durationLabel}</span></p>
                    </div>
                </div>
                <div class="text-right">
                    <span class="text-xs font-black text-green-400 block">${tier.growthLabel}</span>
                    <span class="text-[9px] text-purple-300 font-semibold">Select ➔</span>
                </div>
            </div>
        `;
    });
}

function selectJourneyTier(index) {
    selectedExpeditionTier = EXPEDITION_TIERS[index];
    renderJourneyView();
}

function cancelTierSelect() {
    selectedExpeditionTier = null;
    renderJourneyView();
}

// --- RENDER ROSTER SELECTION ---
function renderJourneyRosterSelect() {
    const list = document.getElementById('journey-select-list');
    const header = document.getElementById('journey-select-header');
    if (!list || !selectedExpeditionTier) return;

    if (header) {
        header.innerHTML = `Send on <span class="text-purple-400 font-bold">${selectedExpeditionTier.name}</span> (${selectedExpeditionTier.growthLabel})`;
    }

    list.innerHTML = '';

    gameState.roster.forEach((p, index) => {
        list.innerHTML += `
            <div onclick="startJourney(${index})" class="flex items-center justify-between p-3 bg-gray-800/90 hover:bg-indigo-900/50 border border-gray-700 hover:border-indigo-400 rounded-xl cursor-pointer active:scale-95 transition-all shadow">
                <div class="flex items-center gap-3">
                    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${p.id}.gif" class="w-10 h-10 object-contain pixel-perfect">
                    <div class="text-left">
                        <h4 class="font-bold text-sm text-white">${p.name}</h4>
                        <p class="text-[10px] text-gray-400">Lv. ${p.level} • CP: ${p.maxHp + p.attack + p.defense}</p>
                    </div>
                </div>
                <button class="bg-purple-600 hover:bg-purple-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow">
                    Deploy 🏕️
                </button>
            </div>
        `;
    });
}

// --- START EXPEDITION ---
function startJourney(rosterIndex) {
    if (!selectedExpeditionTier || !gameState.roster[rosterIndex]) return;

    syncCurrentPokemonToRoster();

    let target = gameState.roster[rosterIndex];
    let now = Date.now();

    gameState.activeJourney = {
        rosterIndex: rosterIndex,
        pokemonId: target.id,
        pokemonName: target.name,
        tierName: selectedExpeditionTier.name,
        xpPct: selectedExpeditionTier.xpPct,
        growthLabel: selectedExpeditionTier.growthLabel,
        startTime: now,
        endTime: now + selectedExpeditionTier.timeMs,
        durationMs: selectedExpeditionTier.timeMs
    };

    selectedExpeditionTier = null;
    updateHub();
    renderJourneyView();

    showModal("🏕️ EXPEDITION DEPLOYED!", `${target.name} has departed for <strong>${gameState.activeJourney.tierName}</strong>! Check back when training completes!`);
    if (navigator.vibrate) navigator.vibrate([40, 60]);
}

// --- ACTIVE JOURNEY LIVE UPDATE & CLAIM ---
function updateActiveJourneyDisplay() {
    const active = gameState.activeJourney;
    if (!active) return;

    const nameEl = document.getElementById('journey-active-name');
    const spriteEl = document.getElementById('journey-active-sprite');
    const timeEl = document.getElementById('journey-active-timer');
    const barEl = document.getElementById('journey-active-progress');
    const actionBtn = document.getElementById('journey-active-btn');

    if (!timeEl || !barEl || !actionBtn) return;

    let now = Date.now();
    let timeLeft = Math.max(0, active.endTime - now);
    let elapsed = active.durationMs - timeLeft;
    let progressPct = Math.min(100, Math.max(0, (elapsed / active.durationMs) * 100));

    if (nameEl) nameEl.innerText = `${active.pokemonName} (${active.tierName})`;
    if (spriteEl) spriteEl.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${active.pokemonId}.gif`;

    barEl.style.width = `${progressPct}%`;

    if (timeLeft <= 0) {
        timeEl.innerText = "Training Complete! 🎉";
        timeEl.className = "text-sm font-black text-green-400 animate-pulse";
        actionBtn.innerText = "Claim Rewards & XP! 🎁";
        actionBtn.className = "w-full py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-all";
        actionBtn.onclick = claimJourneyReward;
    } else {
        timeEl.innerText = `Time Remaining: ${formatTimeRemaining(timeLeft)}`;
        timeEl.className = "text-xs font-bold text-yellow-400";
        actionBtn.innerText = "In Training... ⏳";
        actionBtn.className = "w-full py-3 bg-gray-700 text-gray-400 rounded-xl font-bold cursor-not-allowed opacity-75";
        actionBtn.onclick = null;
    }
}

function formatTimeRemaining(ms) {
    let totalSec = Math.floor(ms / 1000);
    let hrs = Math.floor(totalSec / 3600);
    let mins = Math.floor((totalSec % 3600) / 60);
    let secs = totalSec % 60;

    if (hrs > 0) {
        return `${hrs}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
}

// --- CLAIM EXPEDITION REWARD (SYNCHRONIZED STATE ENGINE - 1.67) ---
function claimJourneyReward() {
    const active = gameState.activeJourney;
    if (!active || Date.now() < active.endTime) return;

    let activeIdx = active.rosterIndex ?? 0;
    let target = gameState.roster[activeIdx] || gameState.roster[0];

    // Calculate XP reward
    let gainedXp = Math.max(10, Math.floor(target.maxXp * active.xpPct));
    let oldLevel = target.level;

    // Apply XP with your 1.67 scaling multiplier
    target.xp += gainedXp;
    let levelUps = 0;

    while (target.xp >= target.maxXp) {
        target.xp -= target.maxXp;
        target.level++;
        levelUps++;
        target.maxXp = Math.floor(target.maxXp * 1.67);
        
        let statBuff = gameState.hearts >= 5 ? 1.10 : (gameState.hearts >= 3 ? 1.05 : 1.0);
        target.maxHp = Math.max(target.maxHp + 1, Math.floor(target.maxHp * statBuff));
        target.attack = Math.max(target.attack + 1, Math.floor(target.attack * statBuff));
        target.defense = Math.max(target.defense + 1, Math.floor(target.defense * statBuff));
        target.spAtk = Math.max(target.spAtk + 1, Math.floor(target.spAtk * statBuff));
        target.spDef = Math.max(target.spDef + 1, Math.floor(target.spDef * statBuff));
        target.speed = Math.max(target.speed + 1, Math.floor(target.speed * statBuff));
        target.critRate = parseFloat(((target.critRate || 5.0) + 0.05).toFixed(2));
    }

    // Check for evolution
    const evo = (typeof EVOLUTION_DATABASE !== 'undefined') ? EVOLUTION_DATABASE[target.id] : null;
    let evolvedNotice = "";
    if (evo && target.level >= evo.level) {
        evolvedNotice = `<br><span class="text-pink-400 font-bold">✨ Evolved into ${evo.toName}!</span>`;
        target.id = evo.toId;
        target.name = evo.toName;
        if (evo.type) target.type = evo.type;
        target.maxHp += 40;
        target.attack += 25;
        target.defense += 25;
        target.spAtk += 25;
        target.spDef += 25;
        target.speed += 20;
    }

    // Guaranteed Sync to Active Game State
    let currentActiveIdx = gameState.activeRosterIndex ?? 0;
    if (activeIdx === currentActiveIdx) {
        gameState.id = target.id;
        gameState.name = target.name;
        gameState.type = target.type || 'normal';
        gameState.level = target.level;
        gameState.xp = target.xp;
        gameState.maxXp = target.maxXp;
        gameState.maxHp = target.maxHp;
        gameState.attack = target.attack;
        gameState.defense = target.defense;
        gameState.spAtk = target.spAtk;
        gameState.spDef = target.spDef;
        gameState.speed = target.speed;
        gameState.critRate = target.critRate || 5.0;
    }

    gameState.activeJourney = null;
    
    // Permanently write to roster memory and save file
    if (typeof syncCurrentPokemonToRoster === 'function') syncCurrentPokemonToRoster();
    localStorage.setItem('pokeSave', JSON.stringify(gameState));

    closeJourneyModal();
    updateHub();

    let resultCard = `
        <div class="bg-gray-900/80 p-4 rounded-xl border border-green-500/40 text-left text-xs space-y-2 mt-2 shadow-inner">
            <div>⚡ <strong class="text-white">XP Gained:</strong> <span class="text-green-400 font-bold">+${formatNumber(gainedXp)} XP</span></div>
            <div>📈 <strong class="text-white">Level:</strong> <span class="text-yellow-400 font-bold">Lv. ${oldLevel} ➔ Lv. ${target.level}</span> ${levelUps > 0 ? `(+${levelUps} Levels!)` : ''}</div>
            <div>💪 <strong class="text-white">New Max HP:</strong> <span class="text-green-300 font-bold">${target.maxHp}</span> • Atk: <span class="text-red-300 font-bold">${target.attack}</span></div>
            ${evolvedNotice}
        </div>
    `.trim();

    showModal("🎉 EXPEDITION COMPLETE!", resultCard, [50, 100, 50]);
}

// Live timer tick every second for active training
setInterval(() => {
    if (gameState.activeJourney && !document.getElementById('journey-modal').classList.contains('hidden')) {
        updateActiveJourneyDisplay();
    }
}, 1000);