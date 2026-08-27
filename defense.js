// ============================================================================
// ENDLESS SWARM TOWER DEFENSE ENGINE (defense.js) - 24/7 PERSISTENT
// ============================================================================

var defenseCanvas, defenseCtx;
var defenseAnimId = null;
var isDefenseRunning = false;

// Tower & Wave In-Memory State
var towerHp = 1000;
var towerMaxHp = 1000;
var defenseStage = 1;
var waveEnemiesRemaining = 500;
var waveKills = 0;
var isBreather = false;
var breatherCountdown = 30;
var lastSpawnTime = 0;
var lastDefenderShotTime = 0;

// Defender Formation (3 Unique Slots)
var selectedSlotToAssign = 0;

// Active Canvas Entities
var defenseEnemies = [];
var defenseProjectiles = [];
var defenseFloatingTexts = [];

// Sprite Image Cache for Canvas Rendering
var spriteCache = {};
function getCachedSprite(id) {
    if (!spriteCache[id]) {
        let img = new Image();
        img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;
        spriteCache[id] = img;
    }
    return spriteCache[id];
}

// --- INITIALIZE & START DEFENSE MODE ---
function openDefenseMode() {
    if (!gameState.roster || gameState.roster.length === 0) {
        showModal("No Pokémon!", "You need at least 1 Pokémon to defend your castle!");
        return;
    }

    // Ensure defense state exists
    if (!gameState.defenseState) {
        gameState.defenseState = {
            stage: 1, kills: 0, remaining: 500,
            towerHp: null, towerMaxHp: null,
            slots: [0, null, null], lastTick: Date.now()
        };
    }

    // Clean up defender slots (Strictly unique, no duplicate assignment)
    validateUniqueDefenderSlots();
    calculateTowerStats();

    // Load Persistent Wave Progress (Never resets unless defeated)
    defenseStage = gameState.defenseState.stage || 1;
    waveKills = gameState.defenseState.kills || 0;
    waveEnemiesRemaining = (gameState.defenseState.remaining !== undefined) ? gameState.defenseState.remaining : 500;
    
    if (gameState.defenseState.towerHp !== null && gameState.defenseState.towerHp !== undefined) {
        towerHp = Math.min(towerMaxHp, gameState.defenseState.towerHp);
    } else {
        towerHp = towerMaxHp;
    }

    showScreen('defense-screen');
    initDefenseCanvas();

    isDefenseRunning = true;
    defenseEnemies = [];
    defenseProjectiles = [];
    defenseFloatingTexts = [];
    isBreather = false;

    updateDefenseTopUI();
    updateTowerHealthBar();
    renderDefenderUIChips();

    lastSpawnTime = Date.now();
    lastDefenderShotTime = Date.now();

    if (defenseAnimId) cancelAnimationFrame(defenseAnimId);
    defenseAnimId = requestAnimationFrame(defenseGameLoop);
}

function leaveDefenseMode() {
    isDefenseRunning = false;
    if (defenseAnimId) cancelAnimationFrame(defenseAnimId);

    // Save exact live progress
    syncDefenseStateToMemory();
    localStorage.setItem('pokeSave', JSON.stringify(gameState));

    showScreen('hub-screen');
    updateHub();
}

function syncDefenseStateToMemory() {
    if (!gameState.defenseState) gameState.defenseState = {};
    gameState.defenseState.stage = defenseStage;
    gameState.defenseState.kills = waveKills;
    gameState.defenseState.remaining = waveEnemiesRemaining;
    gameState.defenseState.towerHp = Math.floor(towerHp);
    gameState.defenseState.towerMaxHp = towerMaxHp;
    gameState.defenseState.lastTick = Date.now();
}

// --- CALCULATE TOWER STATS (SCALED FROM TOTAL ROSTER CP) ---
function calculateTowerStats() {
    let totalRosterHp = 0;

    gameState.roster.forEach(p => {
        totalRosterHp += (p.maxHp || 40) * 3;
    });

    towerMaxHp = Math.max(500, totalRosterHp);
    if (!towerHp || towerHp > towerMaxHp) towerHp = towerMaxHp;
    if (gameState.defenseState) gameState.defenseState.towerMaxHp = towerMaxHp;
}

// --- VALIDATE UNIQUE SLOTS (NO DUPLICATE CLONES OF THE SAME POKEMON) ---
function validateUniqueDefenderSlots() {
    if (!gameState.defenseState.slots) gameState.defenseState.slots = [0, null, null];
    let slots = gameState.defenseState.slots;
    let usedIndices = new Set();

    for (let i = 0; i < 3; i++) {
        let rIdx = slots[i];
        if (rIdx !== null && rIdx !== undefined) {
            // If invalid index or already assigned to a previous slot
            if (rIdx >= gameState.roster.length || usedIndices.has(rIdx)) {
                slots[i] = null;
            } else {
                usedIndices.add(rIdx);
            }
        }
    }

    // Ensure at least slot 0 has a defender if available
    if (slots[0] === null && gameState.roster.length > 0) {
        slots[0] = 0;
    }
}

// --- CANVAS SETUP & RESIZE ---
function initDefenseCanvas() {
    defenseCanvas = document.getElementById('defense-canvas');
    if (!defenseCanvas) return;
    defenseCtx = defenseCanvas.getContext('2d');

    const rect = defenseCanvas.parentElement.getBoundingClientRect();
    defenseCanvas.width = rect.width;
    defenseCanvas.height = rect.height;
}

window.addEventListener('resize', () => {
    if (isDefenseRunning && defenseCanvas) {
        initDefenseCanvas();
    }
});

// ============================================================================
// MAIN 60 FPS GAME LOOP
// ============================================================================
function defenseGameLoop() {
    if (!isDefenseRunning) return;

    let now = Date.now();
    defenseCtx.clearRect(0, 0, defenseCanvas.width, defenseCanvas.height);

    // 1. Draw Castle Defensive Ground Barrier
    drawCastleDefenseBase();

    // 2. Handle Enemy Wave Spawning
    if (!isBreather) {
        if (waveEnemiesRemaining > 0) {
            let spawnRate = Math.max(250, 700 - (defenseStage * 25));
            if (now - lastSpawnTime > spawnRate) {
                spawnSwarmEnemy();
                lastSpawnTime = now;
            }
        } else if (defenseEnemies.length === 0) {
            startWaveBreather();
        }
    } else {
        drawBreatherBanner();
    }

    // 3. Defenders Automatic Elemental Shooting
    let attackInterval = 450;
    if (now - lastDefenderShotTime > attackInterval && !isBreather && defenseEnemies.length > 0) {
        fireDefenderProjectiles();
        lastDefenderShotTime = now;
    }

    // 4. Passive Tower Health Regen
    regenerateTowerHealth();

    // 5. Update & Draw Entities
    updateAndDrawProjectiles();
    updateAndDrawEnemies();
    updateAndDrawParticles();
    drawDefenderSprites();

    // Check Tower Defeat
    if (towerHp <= 0) {
        handleTowerDefeated();
        return;
    }

    defenseAnimId = requestAnimationFrame(defenseGameLoop);
}

// --- DRAW CASTLE BASE & DEFENDERS ---
function drawCastleDefenseBase() {
    let w = defenseCanvas.width;
    let h = defenseCanvas.height;

    let grad = defenseCtx.createLinearGradient(0, h - 90, 0, h);
    grad.addColorStop(0, 'rgba(30, 41, 59, 0.4)');
    grad.addColorStop(1, 'rgba(15, 23, 42, 0.95)');

    defenseCtx.fillStyle = grad;
    defenseCtx.fillRect(0, h - 90, w, 90);

    defenseCtx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
    defenseCtx.lineWidth = 2;
    defenseCtx.beginPath();
    defenseCtx.moveTo(0, h - 90);
    defenseCtx.lineTo(w, h - 90);
    defenseCtx.stroke();
}

function drawDefenderSprites() {
    let w = defenseCanvas.width;
    let h = defenseCanvas.height;
    let positions = [w * 0.22, w * 0.50, w * 0.78];
    let yPos = h - 65;
    let slots = gameState.defenseState ? gameState.defenseState.slots : [0, null, null];

    positions.forEach((x, index) => {
        let rIdx = slots[index];
        if (rIdx === null || rIdx === undefined || !gameState.roster[rIdx]) {
            // Empty Tower Pad
            defenseCtx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
            defenseCtx.lineWidth = 1;
            defenseCtx.setLineDash([4, 4]);
            defenseCtx.beginPath();
            defenseCtx.arc(x, yPos + 18, 14, 0, Math.PI * 2);
            defenseCtx.stroke();
            defenseCtx.setLineDash([]);
            return;
        }

        let p = gameState.roster[rIdx];
        let sprite = getCachedSprite(p.id);
        if (sprite && sprite.complete) {
            defenseCtx.drawImage(sprite, x - 24, yPos - 24, 48, 48);
        }

        defenseCtx.strokeStyle = getElementColor(p.type || 'normal');
        defenseCtx.lineWidth = 1.5;
        defenseCtx.beginPath();
        defenseCtx.arc(x, yPos + 18, 16, 0, Math.PI * 2);
        defenseCtx.stroke();
    });
}

// --- SPAWN SWARM ENEMY ---
function spawnSwarmEnemy() {
    let isBossEnemy = (waveKills > 0 && waveKills % 100 === 0 && !defenseEnemies.some(e => e.isBoss));
    let basePool = typeof BASE_POKEMON_IDS !== 'undefined' ? BASE_POKEMON_IDS : [16, 19, 21, 29, 32, 41, 43, 46];
    let bossPool = typeof EVOLVED_BOSS_IDS !== 'undefined' ? EVOLVED_BOSS_IDS : [18, 20, 22, 31, 34, 42, 45, 47];

    let randomId = isBossEnemy 
        ? bossPool[Math.floor(Math.random() * bossPool.length)]
        : basePool[Math.floor(Math.random() * basePool.length)];

    let eLvl = Math.max(1, Math.floor(defenseStage * 1.5) + (isBossEnemy ? 5 : 0));
    let baseHp = Math.floor((30 + (defenseStage * 12)) * (isBossEnemy ? 5.5 : 1.0));

    let enemy = {
        id: randomId,
        x: Math.random() * (defenseCanvas.width - 50) + 25,
        y: -30,
        size: isBossEnemy ? 40 : 26,
        hp: baseHp,
        maxHp: baseHp,
        speed: (0.7 + (Math.random() * 0.4) + (defenseStage * 0.04)) * (isBossEnemy ? 0.65 : 1.0),
        level: eLvl,
        isBoss: isBossEnemy,
        damage: Math.max(5, Math.floor((6 + defenseStage * 2) * (isBossEnemy ? 2.5 : 1.0)))
    };

    defenseEnemies.push(enemy);
    waveEnemiesRemaining--;
    syncDefenseStateToMemory();
    updateDefenseTopUI();
}

// --- FIRE DEFENDER PROJECTILES ---
function fireDefenderProjectiles() {
    let w = defenseCanvas.width;
    let h = defenseCanvas.height;
    let positions = [w * 0.22, w * 0.50, w * 0.78];
    let slots = gameState.defenseState ? gameState.defenseState.slots : [0, null, null];

    positions.forEach((x, index) => {
        let rIdx = slots[index];
        if (rIdx === null || rIdx === undefined || !gameState.roster[rIdx]) return;

        let p = gameState.roster[rIdx];

        // Target closest enemy
        let closest = null;
        let minDist = 99999;

        defenseEnemies.forEach(e => {
            let dist = Math.hypot(e.x - x, e.y - (h - 65));
            if (dist < minDist) {
                minDist = dist;
                closest = e;
            }
        });

        if (closest) {
            let angle = Math.atan2(closest.y - (h - 65), closest.x - x);
            let pType = p.type || 'normal';

            defenseProjectiles.push({
                x: x,
                y: h - 65,
                vx: Math.cos(angle) * 7.5,
                vy: Math.sin(angle) * 7.5,
                type: pType,
                color: getElementColor(pType),
                damage: Math.max(10, Math.floor((p.attack + p.spAtk) * 0.65)),
                radius: pType === 'fire' ? 6 : (pType === 'water' ? 5 : 4),
                pierce: pType === 'water' ? 2 : 1
            });
        }
    });
}

// --- UPDATE & DRAW PROJECTILES ---
function updateAndDrawProjectiles() {
    for (let i = defenseProjectiles.length - 1; i >= 0; i--) {
        let pr = defenseProjectiles[i];
        pr.x += pr.vx;
        pr.y += pr.vy;

        defenseCtx.fillStyle = pr.color;
        defenseCtx.shadowColor = pr.color;
        defenseCtx.shadowBlur = 8;
        defenseCtx.beginPath();
        defenseCtx.arc(pr.x, pr.y, pr.radius, 0, Math.PI * 2);
        defenseCtx.fill();
        defenseCtx.shadowBlur = 0;

        for (let j = defenseEnemies.length - 1; j >= 0; j--) {
            let e = defenseEnemies[j];
            let dist = Math.hypot(pr.x - e.x, pr.y - e.y);

            if (dist < pr.radius + (e.size / 2)) {
                e.hp -= pr.damage;
                spawnDefenseParticle(e.x, e.y, pr.color);
                spawnDefenseText(e.x, e.y - 10, `-${pr.damage}`, '#f87171');

                if (e.hp <= 0) {
                    defenseEnemies.splice(j, 1);
                    waveKills++;
                    grantDefenseTrickleXP();
                    spawnDefenseText(e.x, e.y, '+0.1% XP', '#4ade80');
                    syncDefenseStateToMemory();
                    updateDefenseTopUI();
                }

                pr.pierce--;
                if (pr.pierce <= 0) {
                    defenseProjectiles.splice(i, 1);
                    break;
                }
            }
        }

        if (pr.y < -10 || pr.x < -10 || pr.x > defenseCanvas.width + 10) {
            defenseProjectiles.splice(i, 1);
        }
    }
}

// --- UPDATE & DRAW SWARM ENEMIES ---
function updateAndDrawEnemies() {
    let h = defenseCanvas.height;

    for (let i = defenseEnemies.length - 1; i >= 0; i--) {
        let e = defenseEnemies[i];
        e.y += e.speed;

        let sprite = getCachedSprite(e.id);
        if (sprite && sprite.complete) {
            defenseCtx.drawImage(sprite, e.x - e.size / 2, e.y - e.size / 2, e.size, e.size);
        }

        let barW = e.size * 1.1;
        let barH = 3;
        let hpRatio = Math.max(0, e.hp / e.maxHp);

        defenseCtx.fillStyle = 'rgba(0,0,0,0.6)';
        defenseCtx.fillRect(e.x - barW / 2, e.y - (e.size / 2) - 6, barW, barH);

        defenseCtx.fillStyle = e.isBoss ? '#ec4899' : '#22c55e';
        defenseCtx.fillRect(e.x - barW / 2, e.y - (e.size / 2) - 6, barW * hpRatio, barH);

        // Reach Castle Wall ➔ Damage Tower
        if (e.y >= h - 85) {
            towerHp = Math.max(0, towerHp - e.damage);
            spawnDefenseText(e.x, h - 80, `-${e.damage}`, '#ef4444');
            updateTowerHealthBar();
            syncDefenseStateToMemory();
            defenseEnemies.splice(i, 1);
        }
    }
}

function regenerateTowerHealth() {
    if (towerHp < towerMaxHp) {
        towerHp = Math.min(towerMaxHp, towerHp + (towerMaxHp * 0.0005));
        updateTowerHealthBar();
    }
}

function grantDefenseTrickleXP() {
    if (!gameState.roster || gameState.roster.length === 0) return;

    let trickle = Math.max(1, Math.floor((gameState.maxXp || 50) * 0.001));
    gameState.xp += trickle;

    if (gameState.xp >= gameState.maxXp) {
        gameState.xp -= gameState.maxXp;
        gameState.level++;
        gameState.maxXp = Math.floor(gameState.maxXp * 1.67);

        gameState.maxHp = Math.max(gameState.maxHp + 1, Math.floor(gameState.maxHp * 1.05));
        gameState.attack = Math.max(gameState.attack + 1, Math.floor(gameState.attack * 1.05));
        gameState.defense = Math.max(gameState.defense + 1, Math.floor(gameState.defense * 1.05));
        gameState.spAtk = Math.max(gameState.spAtk + 1, Math.floor(gameState.spAtk * 1.05));
        gameState.spDef = Math.max(gameState.spDef + 1, Math.floor(gameState.spDef * 1.05));
        gameState.speed = Math.max(gameState.speed + 1, Math.floor(gameState.speed * 1.05));
    }

    if (typeof syncCurrentPokemonToRoster === 'function') syncCurrentPokemonToRoster();
}

// --- FLOATING TEXTS & PARTICLES ---
function spawnDefenseText(x, y, text, color) {
    defenseFloatingTexts.push({ x, y, text, color, alpha: 1.0, vy: -0.8 });
}

function spawnDefenseParticle(x, y, color) {
    for (let i = 0; i < 4; i++) {
        defenseFloatingTexts.push({
            x: x + (Math.random() * 10 - 5),
            y: y + (Math.random() * 10 - 5),
            text: '•',
            color: color,
            alpha: 0.8,
            vy: (Math.random() - 0.5) * 1.5
        });
    }
}

function updateAndDrawParticles() {
    for (let i = defenseFloatingTexts.length - 1; i >= 0; i--) {
        let t = defenseFloatingTexts[i];
        t.y += t.vy;
        t.alpha -= 0.035;

        if (t.alpha <= 0) {
            defenseFloatingTexts.splice(i, 1);
            continue;
        }

        defenseCtx.fillStyle = t.color;
        defenseCtx.globalAlpha = Math.max(0, t.alpha);
        defenseCtx.font = 'bold 10px sans-serif';
        defenseCtx.fillText(t.text, t.x - 8, t.y);
        defenseCtx.globalAlpha = 1.0;
    }
}

// --- WAVE BREATHER / 30S COOLDOWN ENGINE ---
function startWaveBreather() {
    isBreather = true;
    breatherCountdown = 30;

    let timerInterval = setInterval(() => {
        if (!isDefenseRunning) {
            clearInterval(timerInterval);
            return;
        }

        breatherCountdown--;
        if (breatherCountdown <= 0) {
            clearInterval(timerInterval);
            isBreather = false;
            defenseStage++;
            waveEnemiesRemaining = 500;
            waveKills = 0;
            towerHp = towerMaxHp;
            syncDefenseStateToMemory();
            updateDefenseTopUI();
            updateTowerHealthBar();
        }
    }, 1000);
}

function drawBreatherBanner() {
    let w = defenseCanvas.width;
    let h = defenseCanvas.height;

    defenseCtx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    defenseCtx.fillRect(w * 0.1, h * 0.35, w * 0.8, 80);

    defenseCtx.strokeStyle = 'rgba(74, 222, 128, 0.6)';
    defenseCtx.lineWidth = 1.5;
    defenseCtx.strokeRect(w * 0.1, h * 0.35, w * 0.8, 80);

    defenseCtx.fillStyle = '#4ade80';
    defenseCtx.font = 'bold 14px sans-serif';
    defenseCtx.textAlign = 'center';
    defenseCtx.fillText(`🎉 STAGE ${defenseStage} WAVE CLEARED!`, w / 2, h * 0.41);

    defenseCtx.fillStyle = '#fde047';
    defenseCtx.font = 'bold 12px sans-serif';
    defenseCtx.fillText(`Next Wave in: ${breatherCountdown}s (Tower Healed!)`, w / 2, h * 0.46);
    defenseCtx.textAlign = 'start';
}

function handleTowerDefeated() {
    isDefenseRunning = false;
    if (defenseAnimId) cancelAnimationFrame(defenseAnimId);

    // Reset back to Stage 1 upon defeat
    if (gameState.defenseState) {
        gameState.defenseState.stage = 1;
        gameState.defenseState.kills = 0;
        gameState.defenseState.remaining = 500;
        gameState.defenseState.towerHp = towerMaxHp;
    }

    showModal("🏰 CASTLE OVERRUN!", `Your defenses held out until <strong>Stage ${defenseStage}</strong> with ${waveKills} swarm eliminations!<br>Defenses reset to Stage 1. Catch stronger Pokémon and level up to push further!`, [80, 80]);
    leaveDefenseMode();
}

// --- 24/7 BACKGROUND SIMULATION ENGINE ---
setInterval(() => {
    if (isDefenseRunning || !gameState.defenseState) return;

    let def = gameState.defenseState;
    let now = Date.now();
    let elapsedSec = Math.floor((now - (def.lastTick || now)) / 1000);
    if (elapsedSec < 3) return;

    def.lastTick = now;

    // Calculate Assigned Team DPS
    let teamDps = 0;
    let slots = def.slots || [0, null, null];
    slots.forEach(rIdx => {
        if (rIdx !== null && gameState.roster[rIdx]) {
            let p = gameState.roster[rIdx];
            teamDps += (p.attack || 5) + (p.spAtk || 5);
        }
    });

    if (teamDps <= 0) return;

    // Simulate Background Kills (1 kill every ~200 / DPS seconds)
    let killsEarned = Math.floor((teamDps * elapsedSec) / 120);
    if (killsEarned > 0) {
        def.kills = (def.kills || 0) + killsEarned;
        def.remaining = Math.max(0, (def.remaining || 500) - killsEarned);

        // Grant Idle Trickle XP
        let totalTrickle = Math.max(1, Math.floor((gameState.maxXp || 50) * 0.001)) * killsEarned;
        gameState.xp += totalTrickle;

        if (gameState.xp >= gameState.maxXp) {
            gameState.xp -= gameState.maxXp;
            gameState.level++;
            gameState.maxXp = Math.floor(gameState.maxXp * 1.67);
        }

        // Advance Stage if 500 enemies cleared in background
        if (def.remaining <= 0) {
            def.stage = (def.stage || 1) + 1;
            def.remaining = 500;
            def.kills = 0;
            def.towerHp = def.towerMaxHp;
        }

        if (typeof syncCurrentPokemonToRoster === 'function') syncCurrentPokemonToRoster();
        localStorage.setItem('pokeSave', JSON.stringify(gameState));
    }
}, 4000);

// --- UI UPDATE HELPERS ---
function updateDefenseTopUI() {
    const stageEl = document.getElementById('defense-stage-label');
    const killsEl = document.getElementById('defense-kills-label');
    const remainingEl = document.getElementById('defense-remaining-label');

    if (stageEl) stageEl.innerText = `STAGE ${defenseStage}`;
    if (killsEl) killsEl.innerText = `${waveKills} Defeated`;
    if (remainingEl) remainingEl.innerText = `${waveEnemiesRemaining} Left`;
}

function updateTowerHealthBar() {
    const bar = document.getElementById('defense-tower-hp-bar');
    const text = document.getElementById('defense-tower-hp-text');
    if (!bar || !text) return;

    let pct = Math.max(0, Math.min(100, (towerHp / towerMaxHp) * 100));
    bar.style.width = `${pct}%`;
    text.innerText = `CASTLE HEALTH: ${formatNumber(Math.floor(towerHp))} / ${formatNumber(towerMaxHp)} HP`;
}

function renderDefenderUIChips() {
    let slots = gameState.defenseState ? gameState.defenseState.slots : [0, null, null];

    for (let i = 0; i < 3; i++) {
        let chip = document.getElementById(`defender-chip-${i}`);
        let rIdx = slots[i];

        if (chip) {
            if (rIdx !== null && rIdx !== undefined && gameState.roster[rIdx]) {
                let p = gameState.roster[rIdx];
                chip.innerHTML = `
                    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${p.id}.gif" class="w-6 h-6 object-contain pixel-perfect">
                    <span class="truncate max-w-[50px]">${p.name}</span>
                `;
            } else {
                chip.innerHTML = `
                    <span class="text-gray-500 font-bold">+ Slot ${i + 1}</span>
                `;
            }
        }
    }
}

// --- ASSIGN DEFENDERS MODAL (STRICTLY UNIQUE SLOTS) ---
function openAssignDefenderModal(slotIndex) {
    selectedSlotToAssign = slotIndex;
    renderAssignRosterList();

    const modal = document.getElementById('assign-defender-modal');
    const content = document.getElementById('assign-defender-content');
    if (!modal || !content) return;

    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        content.classList.remove('scale-95');
        content.classList.add('scale-100');
    }, 10);
}

function closeAssignDefenderModal() {
    const modal = document.getElementById('assign-defender-modal');
    const content = document.getElementById('assign-defender-content');
    if (!modal || !content) return;

    modal.classList.add('opacity-0');
    content.classList.remove('scale-100');
    content.classList.add('scale-95');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

function renderAssignRosterList() {
    const list = document.getElementById('assign-roster-list');
    if (!list) return;
    list.innerHTML = '';

    let slots = gameState.defenseState ? gameState.defenseState.slots : [0, null, null];

    gameState.roster.forEach((p, index) => {
        let assignedSlot = slots.indexOf(index);
        let isCurrentSlot = (assignedSlot === selectedSlotToAssign);
        let isOtherSlot = (assignedSlot !== -1 && !isCurrentSlot);

        list.innerHTML += `
            <div onclick="selectDefenderForSlot(${index})" class="flex items-center justify-between p-2.5 bg-gray-800 hover:bg-blue-900/40 border ${isCurrentSlot ? 'border-green-400 bg-green-950/40' : (isOtherSlot ? 'border-yellow-500/50 opacity-80' : 'border-gray-700')} rounded-xl cursor-pointer active:scale-95 transition-all">
                <div class="flex items-center gap-3">
                    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${p.id}.gif" class="w-8 h-8 object-contain pixel-perfect">
                    <div class="text-left">
                        <div class="flex items-center gap-1.5">
                            <h4 class="font-bold text-xs text-white">${p.name}</h4>
                            ${isOtherSlot ? `<span class="text-[8px] bg-yellow-600/80 px-1 py-0.2 rounded text-white font-bold">In Slot ${assignedSlot + 1}</span>` : ''}
                        </div>
                        <p class="text-[9px] text-gray-400">Lv. ${p.level} • ${(TYPE_DATABASE[p.type || 'normal'] || TYPE_DATABASE.normal).name}</p>
                    </div>
                </div>
                <span class="text-xs font-bold ${isCurrentSlot ? 'text-green-400' : 'text-blue-400'}">
                    ${isCurrentSlot ? '✓ Assigned' : (isOtherSlot ? 'Swap 🔁' : 'Select ➔')}
                </span>
            </div>
        `;
    });
}

function selectDefenderForSlot(rosterIndex) {
    let slots = gameState.defenseState.slots;

    // If this Pokémon is already in another slot, swap or clear it from that slot
    let existingSlot = slots.indexOf(rosterIndex);
    if (existingSlot !== -1) {
        slots[existingSlot] = null;
    }

    slots[selectedSlotToAssign] = rosterIndex;
    validateUniqueDefenderSlots();

    syncDefenseStateToMemory();
    localStorage.setItem('pokeSave', JSON.stringify(gameState));

    renderDefenderUIChips();
    closeAssignDefenderModal();
    if (navigator.vibrate) navigator.vibrate(20);
}

function getElementColor(type) {
    switch (type) {
        case 'fire': return '#ef4444';
        case 'water': return '#38bdf8';
        case 'grass': return '#4ade80';
        case 'electric': return '#facc15';
        case 'psychic': return '#f472b6';
        case 'poison': return '#c084fc';
        case 'ground':
        case 'rock': return '#f59e0b';
        case 'ice': return '#22d3ee';
        case 'dragon': return '#818cf8';
        case 'ghost':
        case 'dark': return '#a855f7';
        default: return '#e2e8f0';
    }
}