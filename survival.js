// ============================================================================
// 🌲 POKE-SURVIVAL 2D OPEN-WORLD RPG, BASE BUILDING & AUTOMATION (survival.js)
// ============================================================================

var survivalCanvas, survivalCtx;
var survivalAnimId = null;
var isSurvivalRunning = false;

// Player Coordinates & Dynamics
var playerX = 5000;
var playerY = 5000;
var playerSpeed = 3.5;
var playerHp = 100;
var playerMaxHp = 100;
var playerStamina = 100;
var playerMaxStamina = 100;

// Companion Dynamic State
var companionPos = { x: 4970, y: 5000, targetX: 4970, targetY: 5000 };
var companionAttackCooldown = 0;

// World Resource Nodes & Entities
var worldTrees = [];
var worldRocks = [];
var wildEnemies = [];
var survivalFloatingTexts = [];

// Base Building & Modals
var activeBuildItem = null; // 'wall', 'campfire', 'pokesquare'
var selectedBaseStructure = null; // For Worker Assignment Modal

// Controls State
var keysPressed = {};
var touchJoystick = { active: false, startX: 0, startY: 0, dx: 0, dy: 0 };

// --- 1. INITIALIZE SURVIVAL MODE ---
function openSurvivalMode() {
    // Sync active companion stats to player survival HP pool
    playerMaxHp = Math.max(100, gameState.maxHp || 100);
    playerHp = playerMaxHp;

    // Load persistent survival position & resources from gameState
    if (gameState.survivalData) {
        playerX = gameState.survivalData.playerX || 5000;
        playerY = gameState.survivalData.playerY || 5000;
    }

    companionPos.x = playerX - 35;
    companionPos.y = playerY;

    showScreen('survival-screen');
    initSurvivalCanvas();
    generateWorldNodes();
    processPassiveBaseWorkerRewards();

    if (!isSurvivalRunning) {
        isSurvivalRunning = true;
        initSurvivalControls();
        if (survivalAnimId) cancelAnimationFrame(survivalAnimId);
        survivalAnimId = requestAnimationFrame(survivalGameLoop);
    }
    updateSurvivalHUD();
}

function leaveSurvivalMode() {
    isSurvivalRunning = false;
    if (survivalAnimId) cancelAnimationFrame(survivalAnimId);

    // Persist position and structures to gameState
    if (!gameState.survivalData) gameState.survivalData = {};
    gameState.survivalData.playerX = Math.floor(playerX);
    gameState.survivalData.playerY = Math.floor(playerY);
    localStorage.setItem('pokeSave', JSON.stringify(gameState));

    showScreen('hub-screen');
    updateHub();
}

function initSurvivalCanvas() {
    survivalCanvas = document.getElementById('survival-canvas');
    if (!survivalCanvas) return;
    survivalCtx = survivalCanvas.getContext('2d');

    const rect = survivalCanvas.parentElement.getBoundingClientRect();
    survivalCanvas.width = rect.width;
    survivalCanvas.height = rect.height;
}

window.addEventListener('resize', () => {
    if (isSurvivalRunning && survivalCanvas) initSurvivalCanvas();
});

// --- 2. PROCEDURAL WORLD GENERATION ---
function generateWorldNodes() {
    if (worldTrees.length > 0) return;

    for (let i = 0; i < 280; i++) {
        worldTrees.push({
            id: 'tree_' + i,
            x: Math.random() * 8400 + 800,
            y: Math.random() * 8400 + 800,
            hp: 50,
            maxHp: 50,
            radius: 24
        });
    }

    for (let i = 0; i < 180; i++) {
        worldRocks.push({
            id: 'rock_' + i,
            x: Math.random() * 8400 + 800,
            y: Math.random() * 8400 + 800,
            hp: 80,
            maxHp: 80,
            radius: 20
        });
    }

    for (let i = 0; i < 20; i++) {
        spawnWildSurvivalEnemy();
    }
}

function spawnWildSurvivalEnemy() {
    let angle = Math.random() * Math.PI * 2;
    let dist = 500 + Math.random() * 600;
    let wildPool = typeof BASE_POKEMON_IDS !== 'undefined' ? BASE_POKEMON_IDS : [19, 16, 21, 41, 43];
    let wildId = wildPool[Math.floor(Math.random() * wildPool.length)];

    wildEnemies.push({
        id: wildId,
        x: Math.max(200, Math.min(9800, playerX + Math.cos(angle) * dist)),
        y: Math.max(200, Math.min(9800, playerY + Math.sin(angle) * dist)),
        hp: 100,
        maxHp: 100,
        damage: 12,
        speed: 1.6
    });
}

// --- 3. 60 FPS GAME LOOP ---
function survivalGameLoop() {
    if (!isSurvivalRunning) return;

    survivalCtx.clearRect(0, 0, survivalCanvas.width, survivalCanvas.height);

    updatePlayerMovement();
    updateCompanionAI();
    updateSurvivalEnemies();
    updateBaseWorkerTick();

    // Camera follow (Centered on player)
    survivalCtx.save();
    let camX = survivalCanvas.width / 2 - playerX;
    let camY = survivalCanvas.height / 2 - playerY;
    survivalCtx.translate(camX, camY);

    drawWorldGrid();
    drawWorldStructures();
    drawWorldResources();
    drawWildEnemies();
    drawCompanion();
    drawPlayer();
    drawFloatingTexts();

    survivalCtx.restore();

    updateSurvivalHUD();
    survivalAnimId = requestAnimationFrame(survivalGameLoop);
}

// --- PLAYER MOVEMENT & CONTROLS ---
function updatePlayerMovement() {
    let vx = 0;
    let vy = 0;

    if (keysPressed['w'] || keysPressed['arrowup']) vy -= playerSpeed;
    if (keysPressed['s'] || keysPressed['arrowdown']) vy += playerSpeed;
    if (keysPressed['a'] || keysPressed['arrowleft']) vx -= playerSpeed;
    if (keysPressed['d'] || keysPressed['arrowright']) vx += playerSpeed;

    if (touchJoystick.active) {
        vx = touchJoystick.dx * playerSpeed;
        vy = touchJoystick.dy * playerSpeed;
    }

    playerX = Math.max(100, Math.min(9900, playerX + vx));
    playerY = Math.max(100, Math.min(9900, playerY + vy));

    if (vx === 0 && vy === 0 && playerStamina < playerMaxStamina) {
        playerStamina = Math.min(playerMaxStamina, playerStamina + 0.5);
    }
}

function initSurvivalControls() {
    window.addEventListener('keydown', e => { keysPressed[e.key.toLowerCase()] = true; });
    window.addEventListener('keyup', e => { keysPressed[e.key.toLowerCase()] = false; });

    let canvasEl = document.getElementById('survival-canvas');
    if (!canvasEl) return;

    canvasEl.addEventListener('touchstart', handleCanvasTouchStart, { passive: false });
    canvasEl.addEventListener('touchmove', handleCanvasTouchMove, { passive: false });
    canvasEl.addEventListener('touchend', handleCanvasTouchEnd);
    canvasEl.addEventListener('click', handleCanvasClick);
}

function handleCanvasTouchStart(e) {
    e.preventDefault();
    let touch = e.touches[0];
    let rect = survivalCanvas.getBoundingClientRect();
    let screenX = touch.clientX - rect.left;
    let screenY = touch.clientY - rect.top;

    if (activeBuildItem) {
        let worldX = playerX + (screenX - survivalCanvas.width / 2);
        let worldY = playerY + (screenY - survivalCanvas.height / 2);
        playerBuildAtCoords(worldX, worldY);
        return;
    }

    touchJoystick.active = true;
    touchJoystick.startX = touch.clientX;
    touchJoystick.startY = touch.clientY;
    touchJoystick.dx = 0;
    touchJoystick.dy = 0;
}

function handleCanvasTouchMove(e) {
    if (!touchJoystick.active) return;
    e.preventDefault();
    let touch = e.touches[0];
    let dx = touch.clientX - touchJoystick.startX;
    let dy = touch.clientY - touchJoystick.startY;
    let dist = Math.hypot(dx, dy);
    if (dist > 0) {
        touchJoystick.dx = dx / Math.max(dist, 35);
        touchJoystick.dy = dy / Math.max(dist, 35);
    }
}

function handleCanvasTouchEnd() {
    touchJoystick.active = false;
    touchJoystick.dx = 0;
    touchJoystick.dy = 0;
}

function handleCanvasClick(e) {
    let rect = survivalCanvas.getBoundingClientRect();
    let screenX = e.clientX - rect.left;
    let screenY = e.clientY - rect.top;
    let worldX = playerX + (screenX - survivalCanvas.width / 2);
    let worldY = playerY + (screenY - survivalCanvas.height / 2);

    if (activeBuildItem) {
        playerBuildAtCoords(worldX, worldY);
        return;
    }

    // Check interaction with Campfire (Cooking) or PokeSquare (Worker Assignment)
    if (gameState.survivalData && gameState.survivalData.structures) {
        for (let s of gameState.survivalData.structures) {
            let dist = Math.hypot(worldX - s.x, worldY - s.y);
            if (dist < 40) {
                if (s.type === 'campfire') {
                    openCookingModal();
                    return;
                } else if (s.type === 'pokesquare') {
                    openWorkerAssignmentModal(s);
                    return;
                }
            }
        }
    }
}

// --- 4. COMPANION AI (FOLLOWS, GATHERS & DEFENDS) ---
function updateCompanionAI() {
    let distToPlayer = Math.hypot(playerX - companionPos.x, playerY - companionPos.y);

    // Follow player smoothly
    if (distToPlayer > 50) {
        let angle = Math.atan2(playerY - companionPos.y, playerX - companionPos.x);
        companionPos.x += Math.cos(angle) * (playerSpeed * 1.05);
        companionPos.y += Math.sin(angle) * (playerSpeed * 1.05);
    }

    if (companionAttackCooldown > 0) {
        companionAttackCooldown--;
        return;
    }

    // Companion Auto-Attacks nearby wild shadow hostiles
    for (let e of wildEnemies) {
        let dist = Math.hypot(companionPos.x - e.x, companionPos.y - e.y);
        if (dist < 80) {
            let companionDmg = Math.max(15, Math.floor((gameState.attack || 10) * 1.2));
            e.hp -= companionDmg;
            spawnSurvivalFloatingText(e.x, e.y - 15, `-${companionDmg}`, '#ef4444');
            companionAttackCooldown = 30; // 0.5s cooldown
            if (navigator.vibrate) navigator.vibrate(15);
            break;
        }
    }
}

// --- 5. WILD ENEMIES AI & SURVIVAL COMBAT ---
function updateSurvivalEnemies() {
    for (let i = wildEnemies.length - 1; i >= 0; i--) {
        let e = wildEnemies[i];

        if (e.hp <= 0) {
            spawnSurvivalFloatingText(e.x, e.y, '+10 🪵 +5 🪨', '#4ade80');
            gameState.survivalData.wood = (gameState.survivalData.wood || 0) + 10;
            gameState.survivalData.stone = (gameState.survivalData.stone || 0) + 5;
            wildEnemies.splice(i, 1);
            setTimeout(spawnWildSurvivalEnemy, 15000);
            continue;
        }

        let dist = Math.hypot(playerX - e.x, playerY - e.y);
        if (dist < 320) {
            let angle = Math.atan2(playerY - e.y, playerX - e.x);
            e.x += Math.cos(angle) * e.speed;
            e.y += Math.sin(angle) * e.speed;

            if (dist < 28) {
                playerHp = Math.max(0, playerHp - 0.4);
                if (playerHp <= 0) {
                    handleSurvivalPlayerKnockout();
                    return;
                }
            }
        }
    }
}

function handleSurvivalPlayerKnockout() {
    showModal("💀 RESCUED TO HUB!", "Your companion carried you safely back to the Garden Hub! Heal up and venture back!");
    leaveSurvivalMode();
}

// --- 6. DRAWING WORLD GRAPHICS ---
function drawWorldGrid() {
    survivalCtx.strokeStyle = 'rgba(34, 197, 94, 0.08)';
    survivalCtx.lineWidth = 1;
    let gridSize = 120;
    let startX = Math.floor((playerX - survivalCanvas.width) / gridSize) * gridSize;
    let startY = Math.floor((playerY - survivalCanvas.height) / gridSize) * gridSize;

    for (let x = startX; x < playerX + survivalCanvas.width; x += gridSize) {
        survivalCtx.beginPath();
        survivalCtx.moveTo(x, playerY - survivalCanvas.height);
        survivalCtx.lineTo(x, playerY + survivalCanvas.height);
        survivalCtx.stroke();
    }
    for (let y = startY; y < playerY + survivalCanvas.height; y += gridSize) {
        survivalCtx.beginPath();
        survivalCtx.moveTo(playerX - survivalCanvas.width, y);
        survivalCtx.lineTo(playerX + survivalCanvas.width, y);
        survivalCtx.stroke();
    }
}

function drawWorldResources() {
    worldTrees.forEach(t => {
        survivalCtx.fillStyle = '#166534';
        survivalCtx.beginPath();
        survivalCtx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
        survivalCtx.fill();
        survivalCtx.strokeStyle = '#14532d';
        survivalCtx.lineWidth = 3;
        survivalCtx.stroke();

        survivalCtx.fillStyle = '#78350f';
        survivalCtx.fillRect(t.x - 5, t.y - 5, 10, 10);
    });

    worldRocks.forEach(r => {
        survivalCtx.fillStyle = '#64748b';
        survivalCtx.beginPath();
        survivalCtx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        survivalCtx.fill();
        survivalCtx.strokeStyle = '#334155';
        survivalCtx.lineWidth = 3;
        survivalCtx.stroke();
    });
}

function drawWorldStructures() {
    let structures = (gameState.survivalData && gameState.survivalData.structures) || [];

    structures.forEach(s => {
        if (s.type === 'wall') {
            survivalCtx.fillStyle = '#7c2d12';
            survivalCtx.fillRect(s.x - 18, s.y - 18, 36, 36);
            survivalCtx.strokeStyle = '#451a03';
            survivalCtx.lineWidth = 3;
            survivalCtx.strokeRect(s.x - 18, s.y - 18, 36, 36);
        } else if (s.type === 'campfire') {
            survivalCtx.fillStyle = '#ea580c';
            survivalCtx.beginPath();
            survivalCtx.arc(s.x, s.y, 16, 0, Math.PI * 2);
            survivalCtx.fill();
            survivalCtx.fillStyle = '#fde047';
            survivalCtx.beginPath();
            survivalCtx.arc(s.x, s.y, 7, 0, Math.PI * 2);
            survivalCtx.fill();
        } else if (s.type === 'pokesquare') {
            survivalCtx.fillStyle = '#1e3a8a';
            survivalCtx.fillRect(s.x - 28, s.y - 28, 56, 56);
            survivalCtx.strokeStyle = '#60a5fa';
            survivalCtx.lineWidth = 3;
            survivalCtx.strokeRect(s.x - 28, s.y - 28, 56, 56);

            // Draw assigned worker badge over PokeSquare base
            if (s.workerRosterIndex !== null && s.workerRosterIndex !== undefined && gameState.roster[s.workerRosterIndex]) {
                let worker = gameState.roster[s.workerRosterIndex];
                let workerSprite = getCachedSprite(worker.id);
                if (workerSprite && workerSprite.complete) {
                    survivalCtx.drawImage(workerSprite, s.x - 16, s.y - 16, 32, 32);
                }
            }
        }
    });
}

function drawWildEnemies() {
    wildEnemies.forEach(e => {
        let sprite = getCachedSprite(e.id);
        if (sprite && sprite.complete) {
            survivalCtx.drawImage(sprite, e.x - 18, e.y - 18, 36, 36);
        }
    });
}

function drawCompanion() {
    let sprite = getCachedSprite(gameState.id || 1);
    if (sprite && sprite.complete) {
        survivalCtx.drawImage(sprite, companionPos.x - 20, companionPos.y - 20, 40, 40);
    }
}

function drawPlayer() {
    survivalCtx.fillStyle = '#3b82f6';
    survivalCtx.beginPath();
    survivalCtx.arc(playerX, playerY, 16, 0, Math.PI * 2);
    survivalCtx.fill();
    survivalCtx.strokeStyle = '#ffffff';
    survivalCtx.lineWidth = 2.5;
    survivalCtx.stroke();
}

function drawFloatingTexts() {
    for (let i = survivalFloatingTexts.length - 1; i >= 0; i--) {
        let t = survivalFloatingTexts[i];
        t.y += t.vy;
        t.alpha -= 0.03;
        if (t.alpha <= 0) {
            survivalFloatingTexts.splice(i, 1);
            continue;
        }
        survivalCtx.fillStyle = t.color;
        survivalCtx.globalAlpha = Math.max(0, t.alpha);
        survivalCtx.font = 'bold 12px sans-serif';
        survivalCtx.fillText(t.text, t.x, t.y);
        survivalCtx.globalAlpha = 1.0;
    }
}

function spawnSurvivalFloatingText(x, y, text, color) {
    survivalFloatingTexts.push({ x, y, text, color, alpha: 1.0, vy: -0.8 });
}

// --- 7. HARVESTING & BUILDING ENGINE ---
function playerHarvestAction() {
    // Check nearest tree
    let targetTree = worldTrees.find(t => Math.hypot(playerX - t.x, playerY - t.y) < 55);
    if (targetTree) {
        targetTree.hp -= 25;
        gameState.survivalData.wood = (gameState.survivalData.wood || 0) + 5;
        spawnSurvivalFloatingText(targetTree.x, targetTree.y - 15, '+5 🪵 Wood', '#f59e0b');
        if (targetTree.hp <= 0) {
            worldTrees = worldTrees.filter(t => t !== targetTree);
        }
        if (navigator.vibrate) navigator.vibrate(25);
        updateSurvivalHUD();
        return;
    }

    // Check nearest rock
    let targetRock = worldRocks.find(r => Math.hypot(playerX - r.x, playerY - r.y) < 55);
    if (targetRock) {
        targetRock.hp -= 25;
        gameState.survivalData.stone = (gameState.survivalData.stone || 0) + 5;
        spawnSurvivalFloatingText(targetRock.x, targetRock.y - 15, '+5 🪨 Stone', '#94a3b8');
        if (targetRock.hp <= 0) {
            worldRocks = worldRocks.filter(r => r !== targetRock);
        }
        if (navigator.vibrate) navigator.vibrate(25);
        updateSurvivalHUD();
        return;
    }
}

function setBuildItem(type) {
    activeBuildItem = type;
    showModal("🏗️ Build Mode Active", `Selected: <strong class='text-yellow-400'>${type.toUpperCase()}</strong>.<br>Tap anywhere in the open world to place!`);
}

function playerBuildAtCoords(x, y) {
    if (!activeBuildItem) return;

    let costWood = activeBuildItem === 'wall' ? 5 : (activeBuildItem === 'campfire' ? 15 : 30);
    let costStone = activeBuildItem === 'wall' ? 2 : (activeBuildItem === 'campfire' ? 10 : 25);

    let wood = gameState.survivalData.wood || 0;
    let stone = gameState.survivalData.stone || 0;

    if (wood >= costWood && stone >= costStone) {
        gameState.survivalData.wood -= costWood;
        gameState.survivalData.stone -= costStone;

        if (!gameState.survivalData.structures) gameState.survivalData.structures = [];
        gameState.survivalData.structures.push({
            id: 'struct_' + Date.now(),
            type: activeBuildItem,
            x: Math.floor(x),
            y: Math.floor(y),
            hp: 100,
            workerRosterIndex: null,
            lastTick: Date.now()
        });

        let placedType = activeBuildItem;
        activeBuildItem = null;
        updateSurvivalHUD();
        showModal("🎉 Placed!", `${placedType.toUpperCase()} constructed successfully!`);
    } else {
        showModal("Need More Materials!", `Requires ${costWood} 🪵 Wood and ${costStone} 🪨 Stone.`);
    }
}

// --- 8. CAMPFIRE COOKING & SUPER BERRIES ---
function openCookingModal() {
    renderCookingRecipeList();
    const modal = document.getElementById('cooking-modal');
    const content = document.getElementById('cooking-content');
    if (!modal || !content) return;
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        content.classList.remove('scale-95');
        content.classList.add('scale-100');
    }, 10);
}

function closeCookingModal() {
    const modal = document.getElementById('cooking-modal');
    const content = document.getElementById('cooking-content');
    if (!modal || !content) return;
    modal.classList.add('opacity-0');
    content.classList.remove('scale-100');
    content.classList.add('scale-95');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

function renderCookingRecipeList() {
    const list = document.getElementById('cooking-recipe-list');
    if (!list) return;
    list.innerHTML = '';

    let wood = gameState.survivalData.wood || 0;
    let stone = gameState.survivalData.stone || 0;
    let berries = gameState.berries || 0;

    Object.keys(COOKING_RECIPES).forEach(key => {
        let r = COOKING_RECIPES[key];
        let canCook = (wood >= r.woodCost && stone >= r.stoneCost && berries >= r.berryCost);

        list.innerHTML += `
            <div class="flex items-center justify-between p-3 bg-gray-800/90 border ${canCook ? 'border-amber-500/50' : 'border-gray-700 opacity-70'} rounded-xl shadow">
                <div class="flex items-center gap-3">
                    <span class="text-3xl">${r.icon}</span>
                    <div class="text-left">
                        <h4 class="font-bold text-xs ${r.color}">${r.name}</h4>
                        <p class="text-[10px] text-gray-400">${r.desc}</p>
                        <p class="text-[9px] text-amber-300 font-semibold mt-0.5">Cost: ${r.woodCost}🪵 • ${r.stoneCost}🪨 • ${r.berryCost}🍓</p>
                    </div>
                </div>
                <button onclick="cookSuperBerry('${key}')" class="px-3 py-1.5 ${canCook ? 'bg-amber-600 hover:bg-amber-500' : 'bg-gray-700 cursor-not-allowed'} text-white font-bold rounded-lg text-xs shadow active:scale-95 transition-all">
                    Cook 🍳
                </button>
            </div>
        `;
    });
}

function cookSuperBerry(key) {
    let r = COOKING_RECIPES[key];
    if (!r) return;

    let wood = gameState.survivalData.wood || 0;
    let stone = gameState.survivalData.stone || 0;
    let berries = gameState.berries || 0;

    if (wood >= r.woodCost && stone >= r.stoneCost && berries >= r.berryCost) {
        gameState.survivalData.wood -= r.woodCost;
        gameState.survivalData.stone -= r.stoneCost;
        gameState.berries -= r.berryCost;

        // Apply permanent 5% stat boost to active companion
        let statKey = r.stat;
        let gain = Math.max(2, Math.floor((gameState[statKey] || 10) * r.mult));
        gameState[statKey] += gain;

        if (typeof syncCurrentPokemonToRoster === 'function') syncCurrentPokemonToRoster();
        localStorage.setItem('pokeSave', JSON.stringify(gameState));

        renderCookingRecipeList();
        updateSurvivalHUD();
        updateHub();

        showModal("🍲 SUPER BERRY CONSUMED!", `${gameState.name} ate the freshly cooked <strong class='text-yellow-400'>${r.name}</strong>!<br>Permanently boosted <strong class='text-green-400'>+${gain} ${statKey.toUpperCase()}</strong>!`, [50, 80]);
    } else {
        showModal("Insufficient Materials!", "Harvest more wood, stone, and Oran Berries to cook this dish!");
    }
}

// --- 9. POKESQUARE BASE WORKER AUTOMATION ---
function openWorkerAssignmentModal(structure) {
    selectedBaseStructure = structure;
    renderBaseWorkerRosterList();

    const modal = document.getElementById('worker-modal');
    const content = document.getElementById('worker-content');
    if (!modal || !content) return;
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        content.classList.remove('scale-95');
        content.classList.add('scale-100');
    }, 10);
}

function closeWorkerAssignmentModal() {
    const modal = document.getElementById('worker-modal');
    const content = document.getElementById('worker-content');
    if (!modal || !content) return;
    modal.classList.add('opacity-0');
    content.classList.remove('scale-100');
    content.classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
        selectedBaseStructure = null;
    }, 300);
}

function renderBaseWorkerRosterList() {
    const list = document.getElementById('worker-roster-list');
    if (!list || !selectedBaseStructure) return;
    list.innerHTML = '';

    let assignedIndex = selectedBaseStructure.workerRosterIndex;

    gameState.roster.forEach((p, index) => {
        let isAssigned = (assignedIndex === index);

        list.innerHTML += `
            <div onclick="assignWorkerToPokeSquare(${index})" class="flex items-center justify-between p-3 bg-gray-800/90 hover:bg-blue-900/40 border ${isAssigned ? 'border-green-400 bg-green-950/40' : 'border-gray-700'} rounded-xl cursor-pointer active:scale-95 transition-all shadow">
                <div class="flex items-center gap-3">
                    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${p.id}.gif" class="w-10 h-10 object-contain pixel-perfect">
                    <div class="text-left">
                        <h4 class="font-bold text-xs text-white">${p.name}</h4>
                        <p class="text-[9px] text-gray-400">Lv. ${p.level} • Role: Automated Foraging</p>
                    </div>
                </div>
                <span class="text-xs font-bold ${isAssigned ? 'text-green-400' : 'text-blue-400'}">
                    ${isAssigned ? '✓ Assigned' : 'Assign ➔'}
                </span>
            </div>
        `;
    });
}

function assignWorkerToPokeSquare(rosterIndex) {
    if (!selectedBaseStructure) return;
    selectedBaseStructure.workerRosterIndex = rosterIndex;
    selectedBaseStructure.lastTick = Date.now();

    localStorage.setItem('pokeSave', JSON.stringify(gameState));
    closeWorkerAssignmentModal();
    showModal("👷 Worker Assigned!", `${gameState.roster[rosterIndex].name} is now stationed at your Base collecting passive resources!`);
}

// Background tick for active base workers
function updateBaseWorkerTick() {
    if (!gameState.survivalData || !gameState.survivalData.structures) return;

    let now = Date.now();
    gameState.survivalData.structures.forEach(s => {
        if (s.type === 'pokesquare' && s.workerRosterIndex !== null && s.workerRosterIndex !== undefined) {
            if (now - (s.lastTick || now) > 60000) { // Every 60s
                gameState.survivalData.wood = (gameState.survivalData.wood || 0) + 3;
                gameState.survivalData.stone = (gameState.survivalData.stone || 0) + 2;
                gameState.berries = (gameState.berries || 0) + 1;
                s.lastTick = now;
                spawnSurvivalFloatingText(s.x, s.y - 20, '+1 🍓 +3 🪵', '#4ade80');
            }
        }
    });
}

function processPassiveBaseWorkerRewards() {
    if (!gameState.survivalData || !gameState.survivalData.structures) return;

    let now = Date.now();
    let totalWood = 0;
    let totalStone = 0;
    let totalBerries = 0;

    gameState.survivalData.structures.forEach(s => {
        if (s.type === 'pokesquare' && s.workerRosterIndex !== null && s.workerRosterIndex !== undefined) {
            let elapsedMin = Math.min(1440, Math.floor((now - (s.lastTick || now)) / 60000));
            if (elapsedMin > 0) {
                totalWood += elapsedMin * 3;
                totalStone += elapsedMin * 2;
                totalBerries += elapsedMin * 1;
                s.lastTick = now;
            }
        }
    });

    if (totalWood > 0 || totalBerries > 0) {
        gameState.survivalData.wood = (gameState.survivalData.wood || 0) + totalWood;
        gameState.survivalData.stone = (gameState.survivalData.stone || 0) + totalStone;
        gameState.berries = (gameState.berries || 0) + totalBerries;

        showModal("📦 Town Workers Harvest!", `Your stationed Base Pokémon gathered:<br><strong class='text-amber-400'>+${totalWood} 🪵 Wood</strong> • <strong class='text-gray-300'>+${totalStone} 🪨 Stone</strong> • <strong class='text-pink-400'>+${totalBerries} 🍓 Berries</strong>!`);
    }
}

// --- 10. HUD OVERLAY UPDATES ---
function updateSurvivalHUD() {
    const woodEl = document.getElementById('survive-wood');
    const stoneEl = document.getElementById('survive-stone');
    const hpBar = document.getElementById('survive-hp-bar');

    let wood = (gameState.survivalData && gameState.survivalData.wood) || 0;
    let stone = (gameState.survivalData && gameState.survivalData.stone) || 0;

    if (woodEl) woodEl.innerText = formatNumber(wood);
    if (stoneEl) stoneEl.innerText = formatNumber(stone);
    if (hpBar) hpBar.style.width = `${Math.max(0, (playerHp / playerMaxHp) * 100)}%`;
}