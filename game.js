// (TYPE_DATABASE and gameState are loaded globally from global.js)

// Background Interval: Handles Live Heart Loss & Berry Bush Growth
setInterval(() => {
    const isHubVisible = !document.getElementById('hub-screen').classList.contains('hidden');
    const isTabActive = document.visibilityState === 'visible';

    if (gameState.hearts > 0 && isHubVisible && isTabActive) {
        if ((Date.now() - gameState.lastInteraction) >= 300000) {
            gameState.hearts--;
            gameState.lastInteraction = Date.now();
        }
    }

    let elapsedGardenTime = Date.now() - (gameState.lastGardenHarvest || Date.now());
    let berriesGrown = Math.floor(elapsedGardenTime / 120000);
    if (berriesGrown > 0 && (gameState.gardenBerries || 0) < 20) {
        gameState.gardenBerries = Math.min(20, (gameState.gardenBerries || 0) + berriesGrown);
        gameState.lastGardenHarvest = Date.now();
    }

    if (isHubVisible) updateHub();
}, 15000);

// UI Elements (screens array loaded from global.js)
function showScreen(id) {
    screens.forEach(s => document.getElementById(s).classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

// Boot Sequence
window.onload = () => {
    document.getElementById('hub-sprite').onerror = function() {
        this.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${gameState.id}.gif`;
    };
    setTimeout(() => {
        document.getElementById('loading-bar').style.width = '100%';
        setTimeout(() => {
            if(localStorage.getItem('pokeSave')) document.getElementById('btn-continue').classList.remove('hidden');
            showScreen('main-menu');
        }, 800);
    }, 500);
};

// --- NEW GAME CONFIRMATION SYSTEM ---
function handleStartNewGame() {
    if (localStorage.getItem('pokeSave')) {
        openConfirmModal();
    } else {
        executeNewGame();
    }
}

function openConfirmModal() {
    const modal = document.getElementById('confirm-modal');
    const content = document.getElementById('confirm-content');
    if (!modal || !content) return;
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        content.classList.remove('scale-95');
        content.classList.add('scale-100');
    }, 10);
    if (navigator.vibrate) navigator.vibrate([50, 50]);
}

function closeConfirmModal() {
    const modal = document.getElementById('confirm-modal');
    const content = document.getElementById('confirm-content');
    if (!modal || !content) return;
    modal.classList.add('opacity-0');
    content.classList.remove('scale-100');
    content.classList.add('scale-95');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

function executeNewGame() {
    closeConfirmModal();
    localStorage.removeItem('pokeSave');
    startGame(true);
}

// Start or Continue
function startGame(isNew) {
    if (isNew) {
        gameState = {
            id: 1, name: 'Bulbasaur', type: 'grass', level: 1, xp: 0, maxXp: 50, 
            hearts: 2, attack: 5, defense: 5, maxHp: 40,
            spAtk: 6, spDef: 6, speed: 5, critRate: 5.0,
            berries: 5, pokeballs: 3,
            lastInteraction: Date.now(),
            currentStage: 1, maxStage: 1,
            gardenBerries: 1, lastGardenHarvest: Date.now(),
            roster: [{
                id: 1, name: 'Bulbasaur', type: 'grass', level: 1, xp: 0, maxXp: 50,
                attack: 5, defense: 5, maxHp: 40, spAtk: 6, spDef: 6, speed: 5
            }]
        };
        localStorage.setItem('pokeSave', JSON.stringify(gameState));
        updateHub();
        showScreen('intro-screen');
    } else if (localStorage.getItem('pokeSave')) {
        gameState = JSON.parse(localStorage.getItem('pokeSave'));
        
        // --- UNIVERSAL SAVE FILE MIGRATION & REPAIR ENGINE ---
        if (gameState.berries === undefined) gameState.berries = 5;
        if (gameState.pokeballs === undefined) gameState.pokeballs = 3;
        if (gameState.activeRosterIndex === undefined) gameState.activeRosterIndex = 0;
        if (gameState.currentStage === undefined) gameState.currentStage = gameState.enemyLevel || 1;
        if (gameState.maxStage === undefined) gameState.maxStage = gameState.currentStage;
        if (gameState.spAtk === undefined) gameState.spAtk = 6;
        if (gameState.spDef === undefined) gameState.spDef = 6;
        if (gameState.speed === undefined) gameState.speed = 5;
        if (gameState.critRate === undefined) gameState.critRate = 5.0;
        if (gameState.gardenBerries === undefined) gameState.gardenBerries = 1;
        if (!gameState.lastGardenHarvest) gameState.lastGardenHarvest = Date.now();
        if (!gameState.lastInteraction) gameState.lastInteraction = Date.now();
        if (!gameState.items) gameState.items = { hpXL: 0, atkXL: 0, defXL: 0, spAtkXL: 0, spDefXL: 0, speedXL: 0, critXL: 0 };
        if (gameState.activeJourney === undefined) gameState.activeJourney = null;
        if (gameState.activeSweep === undefined) gameState.activeSweep = null;
        
        // Migrate Defense State
        if (!gameState.defenseState) {
            gameState.defenseState = {
                stage: 1,
                kills: 0,
                remaining: 500,
                towerHp: null,
                towerMaxHp: null,
                slots: [0, null, null],
                lastTick: Date.now()
            };
        }

        // Migrate Roster Schema
        if (!gameState.roster || gameState.roster.length === 0) {
            gameState.roster = [{
                id: gameState.id,
                name: gameState.name,
                type: gameState.type || 'grass',
                level: gameState.level,
                maxHp: gameState.maxHp,
                attack: gameState.attack,
                defense: gameState.defense,
                spAtk: gameState.spAtk,
                spDef: gameState.spDef,
                speed: gameState.speed,
                critRate: gameState.critRate || 5.0,
                xp: gameState.xp,
                maxXp: gameState.maxXp
            }];
        } else {
            // Repair any missing stats on caught teammates
            gameState.roster.forEach(p => {
                if (!p.type) p.type = 'normal';
                if (!p.spAtk) p.spAtk = 6;
                if (!p.spDef) p.spDef = 6;
                if (!p.speed) p.speed = 5;
                if (!p.critRate) p.critRate = 5.0;
                if (!p.maxXp) p.maxXp = 50;
            });
        }

        localStorage.setItem('pokeSave', JSON.stringify(gameState));

        let offlinePeriods = Math.floor((Date.now() - gameState.lastInteraction) / (30 * 60000));
        if (offlinePeriods > 0) {
            gameState.hearts = Math.max(1, gameState.hearts - offlinePeriods);
            gameState.lastInteraction = Date.now();
        }

        let gardenBerriesGrown = Math.floor((Date.now() - (gameState.lastGardenHarvest || Date.now())) / 120000);
        if (gardenBerriesGrown > 0) {
            gameState.gardenBerries = Math.min(20, (gameState.gardenBerries || 0) + gardenBerriesGrown);
            gameState.lastGardenHarvest = Date.now();
        }

        updateHub();
        showScreen('hub-screen');
    } else {
        showScreen('intro-screen');
    }
}

// Story Sequence (storyStep & storyLines loaded from global.js)
function nextStory() {
    storyStep++;
    if(storyStep >= storyLines.length) {
        updateHub();
        showScreen('hub-screen');
    } else {
        document.getElementById('story-text').innerText = storyLines[storyStep];
    }
}

// Update Hub UI
function updateHub() {
    document.getElementById('hub-name').innerText = gameState.name;
    document.getElementById('hub-level').innerText = gameState.level;
    
    const hubBarLvl = document.getElementById('hub-bar-level');
    if (hubBarLvl) hubBarLvl.innerText = gameState.level;

    document.getElementById('xp-bar').style.width = `${Math.min(100, (gameState.xp / gameState.maxXp) * 100)}%`;
    const xpText = document.getElementById('xp-text');
    if (xpText) {
        xpText.innerText = `${formatNumber(gameState.xp)} / ${formatNumber(gameState.maxXp)}`;
    }

    const pType = gameState.type || 'grass';
    const typeData = TYPE_DATABASE[pType] || TYPE_DATABASE.grass;
    
    for (let i = 0; i < 4; i++) {
        const chip = document.getElementById(`hub-chip-${i}`);
        if (chip) {
            let cleanMoveName = typeData.moves[i].name.replace(/^[^\s]+\s/, '');
            if (i === 2 && gameState.level < 7) {
                chip.innerText = `🔒 ${cleanMoveName}`;
                chip.className = "px-1.5 py-0.5 rounded text-[8px] font-bold bg-gray-800 text-gray-500 truncate border border-gray-700/50";
            } else if (i === 3 && gameState.level < 13) {
                chip.innerText = `🔒 ${cleanMoveName}`;
                chip.className = "px-1.5 py-0.5 rounded text-[8px] font-bold bg-gray-800 text-gray-500 truncate border border-gray-700/50";
            } else {
                chip.innerText = cleanMoveName;
                let bgColors = ["bg-blue-600", "bg-indigo-600", "bg-green-600", "bg-emerald-600"];
                chip.className = `px-2 py-0.5 rounded text-[9px] font-bold text-white truncate shadow-sm ${bgColors[i]}`;
            }
        }
    }

    document.getElementById('hub-sprite').src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${gameState.id}.gif`;

    let totalPower = (gameState.maxHp || 0) + (gameState.attack || 0) + (gameState.defense || 0) + (gameState.spAtk || 0) + (gameState.spDef || 0) + (gameState.speed || 0);
    const hubPowerEl = document.getElementById('hub-power');
    if (hubPowerEl) {
        hubPowerEl.innerText = formatNumber(totalPower);
    }

    let heartsHtml = '';
    for(let i=0; i<10; i++) {
        heartsHtml += `<span class="text-xl ${i < gameState.hearts ? 'text-red-500' : 'text-gray-600'}">♥</span>`;
    }
    document.getElementById('heart-container').innerHTML = heartsHtml;
    
    if(document.getElementById('berry-count')) {
        document.getElementById('berry-count').innerText = gameState.berries;
    }
    if(document.getElementById('party-count-badge')) {
        document.getElementById('party-count-badge').innerText = (gameState.roster && gameState.roster.length) || 1;
    }

    const bushCount = document.getElementById('bush-count');
    if (bushCount) {
        if (gameState.gardenBerries > 0) {
            bushCount.innerText = `${gameState.gardenBerries} Ready!`;
            bushCount.className = 'text-xs font-black text-pink-400 animate-pulse';
        } else {
            bushCount.innerText = 'Growing...';
            bushCount.className = 'text-xs font-semibold text-gray-400';
        }
    }
    renderBerryStack();

    localStorage.setItem('pokeSave', JSON.stringify(gameState));
}

// (renderBerryStack is loaded from effects.js)

// --- HARVEST BERRY BUSH ---
function harvestBush() {
    if (gameState.gardenBerries > 0) {
        let harvested = gameState.gardenBerries;
        gameState.berries += harvested;
        gameState.gardenBerries = 0;
        gameState.lastGardenHarvest = Date.now();
        
        showModal("Harvest Complete! 🍓", `You picked ${harvested} fresh Oran Berries from your garden!`);
        if (navigator.vibrate) navigator.vibrate([40, 40]);
        updateHub();
    } else {
        showModal("Garden Growing... 🌳", "Berries take 2 minutes to grow. Check back soon or battle to find more!");
    }
}

// --- SMART MODAL QUEUE ENGINE ---
// (modalQueue & isModalActive loaded from global.js)

function showModal(title, text = '', vibratePattern = [50]) {
    modalQueue.push({ title, text, vibratePattern });
    if (!isModalActive) {
        processNextModal();
    }
}

function processNextModal() {
    if (modalQueue.length === 0) {
        isModalActive = false;
        return;
    }

    isModalActive = true;
    const current = modalQueue.shift();

    document.getElementById('modal-title').innerText = current.title;
    // Render raw HTML cleanly without injecting <br> tags into CSS grids
    if (current.text && current.text.includes('<')) {
        document.getElementById('modal-desc').innerHTML = current.text;
    } else {
        document.getElementById('modal-desc').innerHTML = current.text ? current.text.replace(/\n/g, '<br>') : '';
    }
    
    const btn = document.getElementById('modal-btn');
    if (btn) {
        btn.innerText = modalQueue.length > 0 ? "Continue ➔" : "Awesome!";
    }

    const modal = document.getElementById('custom-modal');
    const content = document.getElementById('modal-content');
    
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        content.classList.remove('scale-95');
        content.classList.add('scale-100');
    }, 10);

    if (navigator.vibrate) {
        navigator.vibrate(current.vibratePattern);
    }
}

function closeModal() {
    const modal = document.getElementById('custom-modal');
    const content = document.getElementById('modal-content');
    
    modal.classList.add('opacity-0');
    content.classList.remove('scale-100');
    content.classList.add('scale-95');
    
    setTimeout(() => {
        modal.classList.add('hidden');
        if (modalQueue.length > 0) {
            setTimeout(processNextModal, 150);
        } else {
            isModalActive = false;
        }
    }, 250);
}

// --- STATS PANEL SYSTEM ---
function openStats() {
    document.getElementById('stat-hp').innerText = gameState.maxHp;
    document.getElementById('stat-atk').innerText = gameState.attack;
    document.getElementById('stat-def').innerText = gameState.defense;
    document.getElementById('stat-spatk').innerText = gameState.spAtk;
    document.getElementById('stat-spdef').innerText = gameState.spDef;
    document.getElementById('stat-spd').innerText = gameState.speed;
    document.getElementById('stat-mood').innerText = `${gameState.hearts}/10`;
    
    const critEl = document.getElementById('stat-crit');
    if (critEl) critEl.innerText = `${(gameState.critRate || 5.0).toFixed(2)}%`;
    
    let totalPower = gameState.maxHp + gameState.attack + gameState.defense + gameState.spAtk + gameState.spDef + gameState.speed;
    document.getElementById('stat-cp').innerText = totalPower;
    
    const modal = document.getElementById('stats-modal');
    const content = document.getElementById('stats-content');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        content.classList.remove('scale-95');
        content.classList.add('scale-100');
    }, 10);
    if (navigator.vibrate) navigator.vibrate(20);
}

function closeStats() {
    const modal = document.getElementById('stats-modal');
    const content = document.getElementById('stats-content');
    modal.classList.add('opacity-0');
    content.classList.remove('scale-100');
    content.classList.add('scale-95');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

// --- PARTY / ROSTER SYSTEM ---
function openParty() {
    renderPartyList();
    const modal = document.getElementById('party-modal');
    const content = document.getElementById('party-content');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        content.classList.remove('scale-95');
        content.classList.add('scale-100');
    }, 10);
    if (navigator.vibrate) navigator.vibrate(20);
}

function closeParty() {
    const modal = document.getElementById('party-modal');
    const content = document.getElementById('party-content');
    modal.classList.add('opacity-0');
    content.classList.remove('scale-100');
    content.classList.add('scale-95');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

function renderPartyList() {
    const list = document.getElementById('party-list');
    if (!list) return;
    list.innerHTML = '';

    let activeIdx = gameState.activeRosterIndex ?? 0;

    // Sync active companion's state
    if (gameState.roster[activeIdx]) {
        gameState.roster[activeIdx].level = gameState.level;
        gameState.roster[activeIdx].xp = gameState.xp;
        gameState.roster[activeIdx].maxXp = gameState.maxXp;
        gameState.roster[activeIdx].maxHp = gameState.maxHp;
        gameState.roster[activeIdx].attack = gameState.attack;
        gameState.roster[activeIdx].defense = gameState.defense;
        gameState.roster[activeIdx].spAtk = gameState.spAtk;
        gameState.roster[activeIdx].spDef = gameState.spDef;
        gameState.roster[activeIdx].speed = gameState.speed;
    }

    gameState.roster.forEach((p, index) => {
        let isActive = (index === activeIdx);
        let pCp = (p.maxHp || 0) + (p.attack || 0) + (p.defense || 0) + (p.spAtk || 0) + (p.spDef || 0) + (p.speed || 0);
        let xpPercent = Math.min(100, Math.max(0, ((p.xp || 0) / (p.maxXp || 50)) * 100));

        list.innerHTML += `
            <div onclick="switchActivePokemon(${index})" class="flex flex-col p-3 rounded-2xl border ${isActive ? 'bg-indigo-900/60 border-indigo-400 shadow-lg' : 'bg-gray-800/80 border-gray-700 hover:bg-gray-700/60'} cursor-pointer active:scale-95 transition-all">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${p.id}.gif" class="w-11 h-11 object-contain pixel-perfect drop-shadow">
                        <div class="text-left">
                            <div class="flex items-center gap-2">
                                <h4 class="font-bold text-sm text-white">${p.name}</h4>
                                <span class="text-[9px] px-1.5 py-0.2 rounded font-black ${(TYPE_DATABASE[p.type || 'normal'] || TYPE_DATABASE.normal).bg} text-white">${(TYPE_DATABASE[p.type || 'normal'] || TYPE_DATABASE.normal).name}</span>
                                ${isActive ? '<span class="text-[9px] bg-green-500 text-black font-black px-1.5 py-0.2 rounded">ACTIVE</span>' : ''}
                            </div>
                            <p class="text-xs text-gray-300 font-semibold mt-0.5">
                                <span class="text-yellow-400 font-bold">Lv. ${p.level}</span> • <span class="text-orange-400 font-bold">⚡ ${formatNumber(pCp)} CP</span>
                            </p>
                        </div>
                    </div>
                    <span class="text-xs font-bold ${isActive ? 'text-green-400' : 'text-indigo-400'}">
                        ${isActive ? '✓ Ready' : 'Swap 🔁'}
                    </span>
                </div>
                
                <!-- Live Real-Time XP Bar for this Teammate -->
                <div class="w-full mt-2 pt-1.5 border-t border-gray-700/50 flex items-center gap-2">
                    <div class="flex-1 h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-700">
                        <div class="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300" style="width: ${xpPercent}%"></div>
                    </div>
                    <span class="text-[9px] font-black text-gray-400 select-none">${formatNumber(p.xp || 0)} / ${formatNumber(p.maxXp || 50)}</span>
                </div>
            </div>
        `;
    });
}

function syncCurrentPokemonToRoster() {
    if (!gameState.roster || gameState.roster.length === 0) {
        gameState.roster = [];
    }

    let idx = gameState.activeRosterIndex ?? 0;
    if (idx < 0 || idx >= gameState.roster.length) idx = 0;
    gameState.activeRosterIndex = idx;

    let currentData = {
        id: gameState.id,
        name: gameState.name,
        type: gameState.type || 'normal',
        level: gameState.level,
        maxHp: gameState.maxHp,
        attack: gameState.attack,
        defense: gameState.defense,
        spAtk: gameState.spAtk,
        spDef: gameState.spDef,
        speed: gameState.speed,
        critRate: gameState.critRate || 5.0,
        xp: gameState.xp,
        maxXp: gameState.maxXp
    };

    if (gameState.roster[idx]) {
        gameState.roster[idx] = currentData;
    } else {
        gameState.roster.push(currentData);
    }
}

function switchActivePokemon(index) {
    if (index < 0 || index >= gameState.roster.length) return;
    syncCurrentPokemonToRoster();

    gameState.activeRosterIndex = index; // Sets active companion slot
    let target = gameState.roster[index];

    gameState.id = target.id;
    gameState.name = target.name;
    gameState.type = target.type || 'normal';
    gameState.level = target.level;
    gameState.maxHp = target.maxHp;
    gameState.attack = target.attack;
    gameState.defense = target.defense;
    gameState.spAtk = target.spAtk;
    gameState.spDef = target.spDef;
    gameState.speed = target.speed;
    gameState.critRate = target.critRate || 5.0;
    gameState.xp = target.xp;
    gameState.maxXp = target.maxXp;

    updateHub();
    renderPartyList();
    closeParty();
    showModal("Partner Swapped! 🔄", `You are now adventuring with ${gameState.name} (${(TYPE_DATABASE[gameState.type] || TYPE_DATABASE.normal).name} Type)!`);
}

// (Petting swirl touch interaction is handled by effects.js)
function gainHeart() {
    if(gameState.hearts < 10) {
        gameState.hearts++;
        const effect = document.getElementById('swirl-effect');
        const sprite = document.getElementById('hub-sprite');
        if (effect) effect.classList.add('animate-swirl');
        if (sprite) sprite.classList.add('flash-white');
        
        let heartXp = Math.max(1, Math.floor(gameState.maxXp * 0.005));
        
        setTimeout(() => {
            if (effect) effect.classList.remove('animate-swirl');
            if (sprite) sprite.classList.remove('flash-white');
            addXP(heartXp, false); // Direct XP (no mood multiplier)
        }, 1000);
    }
}

function feedBerry() { 
    if (gameState.berries > 0) {
        if (gameState.hearts < 10) {
            gameState.berries--;
            gainHeart();
        } else {
            // --- FULL 10/10 HEARTS: 5% XP TREAT BONUS ---
            gameState.berries--;
            let bonusXp = Math.max(5, Math.floor(gameState.maxXp * 0.05));
            
            showModal("Yum! Full Belly Treat! 🍓", `${gameState.name} is full, but loved the treat! Gained +${formatNumber(bonusXp)} XP (5% boost)!`);
            if (navigator.vibrate) navigator.vibrate(30);

            addXP(bonusXp, false); // Direct XP (no mood multiplier)
        }
    } else {
        showModal("Out of Berries!", "You don't have any berries left! Harvest your garden bush or win battles to find more.");
    }
}

// --- UNIFIED XP AND MULTI-LEVEL LEVEL-UP SYSTEM ---
function addXP(amount, applyMoodMultiplier = true) {
    let gainedXp = amount;
    if (applyMoodMultiplier) {
        let multiplier = (gameState.hearts <= 1) ? 0 : (gameState.hearts <= 3 ? 0.5 : (gameState.hearts <= 5 ? 2 : 3));
        if (multiplier === 0) {
            showModal(`${gameState.name} is in a bad mood and refuses! Pet it or feed it.`);
            updateHub();
            return;
        }
        gainedXp = Math.floor(amount * multiplier);
    }

    let totalXp = gameState.xp + gainedXp;

    if (totalXp >= gameState.maxXp) {
        const xpBar = document.getElementById('xp-bar');
        if (xpBar) xpBar.style.width = '100%';
        setTimeout(() => {
            levelUp(totalXp);
        }, 600);
    } else {
        gameState.xp = totalXp;
        syncCurrentPokemonToRoster();
        updateHub();
    }
}

function levelUp(totalXp) {
    let oldLevel = gameState.level;
    let currentXp = (typeof totalXp === 'number') ? totalXp : (gameState.xp || 0);
    let levelsGained = 0;

    // Snapshot Previous Stats for Comparison
    let oldStats = {
        level: gameState.level,
        maxHp: gameState.maxHp,
        attack: gameState.attack,
        defense: gameState.defense,
        spAtk: gameState.spAtk,
        spDef: gameState.spDef,
        speed: gameState.speed,
        cp: (gameState.maxHp || 0) + (gameState.attack || 0) + (gameState.defense || 0) + (gameState.spAtk || 0) + (gameState.spDef || 0) + (gameState.speed || 0)
    };

    // Continuous Loop: Consumes full accumulated XP and handles 1, 2, 3+ level jumps smoothly!
    while (currentXp >= gameState.maxXp) {
        currentXp -= gameState.maxXp;
        gameState.level++;
        levelsGained++;
        
        // Exact 1.67 scaling
        gameState.maxXp = Math.floor(gameState.maxXp * 1.67);

        // Stat Growth per Level
        let statBuff = gameState.hearts >= 5 ? 1.10 : (gameState.hearts >= 3 ? 1.05 : 1.0);
        gameState.maxHp = Math.max(gameState.maxHp + 1, Math.floor(gameState.maxHp * statBuff));
        gameState.attack = Math.max(gameState.attack + 1, Math.floor(gameState.attack * statBuff));
        gameState.defense = Math.max(gameState.defense + 1, Math.floor(gameState.defense * statBuff));
        gameState.spAtk = Math.max(gameState.spAtk + 1, Math.floor(gameState.spAtk * statBuff));
        gameState.spDef = Math.max(gameState.spDef + 1, Math.floor(gameState.spDef * statBuff));
        gameState.speed = Math.max(gameState.speed + 1, Math.floor(gameState.speed * statBuff));
        gameState.critRate = parseFloat(((gameState.critRate || 5.0) + 0.05).toFixed(2));
    }

    // Set remaining clean overflow XP (Never negative!)
    gameState.xp = Math.max(0, currentXp);
    syncCurrentPokemonToRoster();
    localStorage.setItem('pokeSave', JSON.stringify(gameState));

    // Reset UI Bar smoothly
    let xpBar = document.getElementById('xp-bar');
    if (xpBar) {
        xpBar.style.transition = 'none';
        xpBar.style.width = '0%';
    }

    setTimeout(() => {
        if (xpBar) xpBar.style.transition = 'all 0.5s ease';
        updateHub();

        // Calculate New Total Combat Power
        let newCp = gameState.maxHp + gameState.attack + gameState.defense + gameState.spAtk + gameState.spDef + gameState.speed;
        let cpGain = newCp - oldStats.cp;

        // Check for Move Unlock Notice
        let moveNotice = "";
        if (gameState.level >= 13 && oldLevel < 13) {
            moveNotice = `<div class='bg-purple-900/60 p-2 rounded-lg border border-purple-400/50 text-center font-bold text-yellow-300 text-[11px] mt-1'>🌟 Unlocked Slot 3 Ultimate Move!</div>`;
        } else if (gameState.level >= 7 && oldLevel < 7) {
            moveNotice = `<div class='bg-blue-900/60 p-2 rounded-lg border border-blue-400/50 text-center font-bold text-yellow-300 text-[11px] mt-1'>✨ Unlocked Slot 2 Special Attack!</div>`;
        }

        //// Rich Level-Up Comparison Card (Centered & Symmetrical)
        let levelUpCard = `
            <div class='bg-gray-900/90 p-4 rounded-2xl border border-yellow-500/40 text-xs space-y-2 mt-2 shadow-inner w-full'>
                <div class='flex justify-between items-center pb-2 border-b border-gray-700'>
                    <span class='font-bold text-white text-sm'>${gameState.name}</span>
                    <span class='text-yellow-400 font-black tracking-wide'>Lv. ${oldStats.level} ➔ Lv. ${gameState.level}</span>
                </div>
                
                <div class='flex items-center justify-center py-1'>
                    <img src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${gameState.id}.gif' class='w-20 h-20 object-contain pixel-perfect drop-shadow-lg animate-bounce'>
                </div>

                <!-- Centered Symmetrical 2-Column Stats Grid -->
                <div class='w-full max-w-[270px] mx-auto grid grid-cols-2 gap-x-5 gap-y-1.5 text-gray-300 pt-2 border-t border-gray-800 text-[11px]'>
                    <div class='flex justify-between items-center'><span>💚 HP:</span> <span><span class='text-gray-400'>${oldStats.maxHp}</span> ➔ <strong class='text-green-400'>${gameState.maxHp}</strong></span></div>
                    <div class='flex justify-between items-center'><span>⚡ SPD:</span> <span><span class='text-gray-400'>${oldStats.speed}</span> ➔ <strong class='text-yellow-400'>${gameState.speed}</strong></span></div>
                    
                    <div class='flex justify-between items-center'><span>❤️ ATK:</span> <span><span class='text-gray-400'>${oldStats.attack}</span> ➔ <strong class='text-red-400'>${gameState.attack}</strong></span></div>
                    <div class='flex justify-between items-center'><span>💜 SP.ATK:</span> <span><span class='text-gray-400'>${oldStats.spAtk}</span> ➔ <strong class='text-purple-400'>${gameState.spAtk}</strong></span></div>
                    
                    <div class='flex justify-between items-center'><span>💙 DEF:</span> <span><span class='text-gray-400'>${oldStats.defense}</span> ➔ <strong class='text-blue-400'>${gameState.defense}</strong></span></div>
                    <div class='flex justify-between items-center'><span>🔮 SP.DEF:</span> <span><span class='text-gray-400'>${oldStats.spDef}</span> ➔ <strong class='text-indigo-400'>${gameState.spDef}</strong></span></div>
                </div>

                ${moveNotice}

                <div class='pt-2.5 border-t border-gray-700 text-center text-orange-400 font-bold'>
                    Total Power: ⚡ ${oldStats.cp} ➔ <strong class='text-orange-300 font-black'>${newCp} CP</strong> <span class='text-green-400 text-[10px]'>(+${cpGain})</span>
                </div>
            </div>
        `.trim();

        let title = (levelsGained > 1) ? `🎉 LEVEL UP! (+${levelsGained})` : `🎉 LEVEL UP!`;
        showModal(title, levelUpCard, [40, 80, 40]);

        // Check for Multi-Stage Evolution
        const evo = (typeof EVOLUTION_DATABASE !== 'undefined') ? EVOLUTION_DATABASE[gameState.id] : null;
        if (evo && gameState.level >= evo.level) {
            setTimeout(() => triggerEvolution(evo.toId, evo.toName, evo.type), 800);
        }
    }, 50);
}

// --- UNIVERSAL EVOLUTION SYSTEM (IN-PLACE TRANSFORMATION) ---
function triggerEvolution(newId, newName, newType) {
    showScreen('evo-screen');
    const oldName = gameState.name;
    document.getElementById('evo-old-name').innerText = oldName;
    document.getElementById('evo-sprite').src = document.getElementById('hub-sprite').src;
    
    setTimeout(() => {
        gameState.id = newId;
        gameState.name = newName;
        if (newType) gameState.type = newType;

        // Evolution Stat Boosts!
        gameState.maxHp += 40;
        gameState.attack += 25;
        gameState.defense += 25;
        gameState.spAtk += 25;
        gameState.spDef += 25;
        gameState.speed += 20;
        
        // Overwrite the existing roster slot directly (prevents cloning)
        let activeIdx = gameState.activeRosterIndex ?? 0;
        if (gameState.roster && gameState.roster[activeIdx]) {
            gameState.roster[activeIdx].id = newId;
            gameState.roster[activeIdx].name = newName;
            if (newType) gameState.roster[activeIdx].type = newType;
            gameState.roster[activeIdx].maxHp = gameState.maxHp;
            gameState.roster[activeIdx].attack = gameState.attack;
            gameState.roster[activeIdx].defense = gameState.defense;
            gameState.roster[activeIdx].spAtk = gameState.spAtk;
            gameState.roster[activeIdx].spDef = gameState.spDef;
            gameState.roster[activeIdx].speed = gameState.speed;
        }

        const evoImg = document.getElementById('evo-sprite');
        evoImg.classList.remove('brightness-0', 'animate-pulse');
        evoImg.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${newId}.gif`;
        
        setTimeout(() => {
            showModal("✨ EVOLUTION COMPLETE! ✨", `Congratulations! Your ${oldName} evolved into a powerful <strong>${newName}</strong>!`, [50, 100, 50]);
            updateHub();
            showScreen('hub-screen');
        }, 2000);
    }, 3000);
}