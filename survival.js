// ============================================================================
// 🌲 POKE-SURVIVAL 2D OPEN-WORLD RPG, COLLISION & BASE BUILDING (survival.js)
// ============================================================================

var survivalCanvas, survivalCtx;
var survivalAnimId = null;
var isSurvivalRunning = false;

// World & Grid Constants (40px Tile Snap & Collision Size)
const GRID_SIZE = 40;
const WALL_HALF = 20; // 40x40 bounding box

var playerX = 5000;
var playerY = 5000;
var playerRadius = 14;
var playerSpeed = 3.5;
var playerHp = 100;
var playerMaxHp = 100;
var playerStamina = 100;
var playerMaxStamina = 100;

// Holographic Blueprint Cursor State
var activeBuildItem = null; // 'wall', 'campfire', 'pokesquare'
var buildCursor = { snapX: 5000, snapY: 5000, isValid: true, active: false };

// Selected Structure for Context Actions (Destroy / Move / Extend)
var inspectedStructure = null;
var wallExtendCount = 1;

// Companion Dynamics
var companionPos = { x: 4965, y: 5000 };
var companionAttackCooldown = 0;

// World Nodes & Visuals
var worldTrees = [];
var worldRocks = [];
var wildEnemies = [];
var worldDecorations = [];
var survivalFloatingTexts = [];
var selectedBaseStructure = null;

// Quest & Tutorial Engine
var currentSurvivalQuest = 0;
const SURVIVAL_QUESTS = [
    { title: "Gather Materials", desc: "Tap 'Gather' near trees & rocks to collect 15 🪵 and 10 🪨", check: () => (gameState.survivalData?.wood >= 15 && gameState.survivalData?.stone >= 10), reward: 50 },
    { title: "Build Defenses", desc: "Select 'Wall' and snap-place your first protective barrier", check: () => (gameState.survivalData?.structures?.some(s => s.type === 'wall')), reward: 75 },
    { title: "Construct Campfire", desc: "Place a Campfire and tap it to cook a Super Berry", check: () => (gameState.survivalData?.structures?.some(s => s.type === 'campfire')), reward: 100 },
    { title: "Establish PokeSquare Base", desc: "Build a Base and station a benched Pokémon worker", check: () => (gameState.survivalData?.structures?.some(s => s.type === 'pokesquare' && s.workerRosterIndex !== null)), reward: 200 }
];

// Controls State
var keysPressed = {};
var touchJoystick = { active: false, startX: 0, startY: 0, dx: 0, dy: 0 };

// --- 1. INITIALIZE SURVIVAL MODE ---
function openSurvivalMode() {
    playerMaxHp = Math.max(100, gameState.maxHp || 100);
    playerHp = playerMaxHp;

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
    updateQuestUI();

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
    cancelBuildMode();
    closeStructureContext();

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

    for (let i = 0; i < 400; i++) {
        worldDecorations.push({
            x: Math.random() * 8800 + 600,
            y: Math.random() * 8800 + 600,
            type: Math.random() < 0.5 ? 'flower' : 'pebble',
            color: Math.random() < 0.33 ? '#fde047' : (Math.random() < 0.5 ? '#f472b6' : '#93c5fd')
        });
    }

    for (let i = 0; i < 280; i++) {
        worldTrees.push({
            id: 'tree_' + i,
            x: Math.random() * 8400 + 800,
            y: Math.random() * 8400 + 800,
            hp: 50,
            maxHp: 50,
            radius: 22
        });
    }

    for (let i = 0; i < 180; i++) {
        worldRocks.push({
            id: 'rock_' + i,
            x: Math.random() * 8400 + 800,
            y: Math.random() * 8400 + 800,
            hp: 80,
            maxHp: 80,
            radius: 18
        });
    }

    for (let i = 0; i < 18; i++) {
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
        damage: 10,
        speed: 1.5,
        attackCooldown: 0
    });
}

// --- 3. 60 FPS SURVIVAL GAME LOOP ---
function survivalGameLoop() {
    if (!isSurvivalRunning) return;

    survivalCtx.clearRect(0, 0, survivalCanvas.width, survivalCanvas.height);

    updatePlayerMovement();
    updateCompanionAI();
    updateSurvivalEnemies();
    updateBaseWorkerTick();

    // World Rendering with Centered Camera
    survivalCtx.save();
    let camX = survivalCanvas.width / 2 - playerX;
    let camY = survivalCanvas.height / 2 - playerY;
    survivalCtx.translate(camX, camY);

    drawTerrainDetails();
    drawWorldGrid();
    drawWorldStructures();
    drawHologramBlueprint();
    drawWorldResources();
    drawWildEnemies();
    drawCompanion();
    drawPlayer();
    drawFloatingTexts();

    survivalCtx.restore();

    updateSurvivalHUD();
    survivalAnimId = requestAnimationFrame(survivalGameLoop);
}

// --- 4. SOLID BOX COLLISION RESOLUTION ---
function checkWallCollision(targetX, targetY, radius) {
    let structures = gameState.survivalData?.structures || [];
    for (let s of structures) {
        if (s.type === 'wall') {
            // AABB vs Circle Collision
            let nearestX = Math.max(s.x - WALL_HALF, Math.min(targetX, s.x + WALL_HALF));
            let nearestY = Math.max(s.y - WALL_HALF, Math.min(targetY, s.y + WALL_HALF));
            let dx = targetX - nearestX;
            let dy = targetY - nearestY;
            if ((dx * dx + dy * dy) < (radius * radius)) {
                return s; // Collided with this wall
            }
        }
    }
    return null;
}

// --- 5. PLAYER MOVEMENT & CONTROLS ---
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

    // Step-by-step X and Y movement with solid collision checking
    let nextX = Math.max(100, Math.min(9900, playerX + vx));
    if (!checkWallCollision(nextX, playerY, playerRadius)) {
        playerX = nextX;
    }

    let nextY = Math.max(100, Math.min(9900, playerY + vy));
    if (!checkWallCollision(playerX, nextY, playerRadius)) {
        playerY = nextY;
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
    let worldX = playerX + (screenX - survivalCanvas.width / 2);
    let worldY = playerY + (screenY - survivalCanvas.height / 2);

    if (activeBuildItem) {
        updateHologramPosition(worldX, worldY);
        return;
    }

    touchJoystick.active = true;
    touchJoystick.startX = touch.clientX;
    touchJoystick.startY = touch.clientY;
    touchJoystick.dx = 0;
    touchJoystick.dy = 0;
}

function handleCanvasTouchMove(e) {
    e.preventDefault();
    let touch = e.touches[0];
    let rect = survivalCanvas.getBoundingClientRect();
    let screenX = touch.clientX - rect.left;
    let screenY = touch.clientY - rect.top;
    let worldX = playerX + (screenX - survivalCanvas.width / 2);
    let worldY = playerY + (screenY - survivalCanvas.height / 2);

    if (activeBuildItem) {
        updateHologramPosition(worldX, worldY);
        return;
    }

    if (!touchJoystick.active) return;
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
        updateHologramPosition(worldX, worldY);
        return;
    }

    // Check interaction with existing structures (Walls, Campfires, Bases)
    if (gameState.survivalData && gameState.survivalData.structures) {
        for (let s of gameState.survivalData.structures) {
            let dist = Math.hypot(worldX - s.x, worldY - s.y);
            if (dist < 32) {
                if (s.type === 'wall') {
                    openStructureContext(s);
                    return;
                } else if (s.type === 'campfire') {
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

// --- 6. BLUEPRINT & PLACEMENT ENGINE ---
function updateHologramPosition(worldX, worldY) {
    buildCursor.snapX = Math.round(worldX / GRID_SIZE) * GRID_SIZE;
    buildCursor.snapY = Math.round(worldY / GRID_SIZE) * GRID_SIZE;

    let costWood = activeBuildItem === 'wall' ? 5 : (activeBuildItem === 'campfire' ? 15 : 30);
    let costStone = activeBuildItem === 'wall' ? 2 : (activeBuildItem === 'campfire' ? 10 : 25);
    let wood = gameState.survivalData?.wood || 0;
    let stone = gameState.survivalData?.stone || 0;

    let isOccupied = gameState.survivalData?.structures?.some(s => s.x === buildCursor.snapX && s.y === buildCursor.snapY);
    buildCursor.isValid = (wood >= costWood && stone >= costStone && !isOccupied);
}

function setBuildItem(type) {
    activeBuildItem = type;
    buildCursor.active = true;
    updateHologramPosition(playerX + 40, playerY);

    const banner = document.getElementById('build-mode-banner');
    const nameEl = document.getElementById('build-banner-name');
    const costEl = document.getElementById('build-banner-cost');

    let costWood = type === 'wall' ? 5 : (type === 'campfire' ? 15 : 30);
    let costStone = type === 'wall' ? 2 : (type === 'campfire' ? 10 : 25);

    if (banner && nameEl && costEl) {
        banner.classList.remove('hidden');
        nameEl.innerText = `Placing: ${type.toUpperCase()}`;
        costEl.innerText = `Cost: ${costWood} 🪵 • ${costStone} 🪨`;
    }
    showSurvivalToast("📐 Move blueprint to aim. Tap 'Place' to build!", 2000);
}

function cancelBuildMode() {
    activeBuildItem = null;
    buildCursor.active = false;
    const banner = document.getElementById('build-mode-banner');
    if (banner) banner.classList.add('hidden');
}

function executeSnapPlacement() {
    if (!activeBuildItem) return;

    let costWood = activeBuildItem === 'wall' ? 5 : (activeBuildItem === 'campfire' ? 15 : 30);
    let costStone = activeBuildItem === 'wall' ? 2 : (activeBuildItem === 'campfire' ? 10 : 25);
    let wood = gameState.survivalData?.wood || 0;
    let stone = gameState.survivalData?.stone || 0;

    if (wood < costWood || stone < costStone) {
        showSurvivalToast(`❌ Need ${costWood}🪵 & ${costStone}🪨!`, 2000);
        return;
    }

    if (!gameState.survivalData.structures) gameState.survivalData.structures = [];

    // Check collision with other structures
    let isOccupied = gameState.survivalData.structures.some(s => s.x === buildCursor.snapX && s.y === buildCursor.snapY);
    if (isOccupied) {
        showSurvivalToast("⚠️ Space already occupied!", 1500);
        return;
    }

    gameState.survivalData.wood -= costWood;
    gameState.survivalData.stone -= costStone;

    gameState.survivalData.structures.push({
        id: 'struct_' + Date.now(),
        type: activeBuildItem,
        x: buildCursor.snapX,
        y: buildCursor.snapY,
        hp: 100,
        maxHp: 100,
        workerRosterIndex: null,
        lastTick: Date.now()
    });

    spawnSurvivalFloatingText(buildCursor.snapX, buildCursor.snapY - 15, `+ ${activeBuildItem.toUpperCase()}`, '#4ade80');
    showSurvivalToast(`✨ ${activeBuildItem.toUpperCase()} Placed!`, 1500);
    if (navigator.vibrate) navigator.vibrate(25);

    checkQuestProgress();
    updateSurvivalHUD();
    localStorage.setItem('pokeSave', JSON.stringify(gameState));
}

// --- 7. STRUCTURE CONTEXT ACTIONS (DESTROY, MOVE, EXTEND) ---
function openStructureContext(structure) {
    inspectedStructure = structure;
    const modal = document.getElementById('structure-context-modal');
    const content = document.getElementById('structure-context-content');
    const title = document.getElementById('struct-info-title');
    const extSection = document.getElementById('wall-extend-section');

    if (!modal || !content) return;

    if (title) title.innerText = `Wall (${Math.floor(structure.hp)}/${structure.maxHp || 100} HP)`;
    if (extSection) {
        if (structure.type === 'wall') extSection.classList.remove('hidden');
        else extSection.classList.add('hidden');
    }

    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        content.classList.remove('translate-y-full');
        content.classList.add('translate-y-0');
    }, 10);
}

function closeStructureContext() {
    const modal = document.getElementById('structure-context-modal');
    const content = document.getElementById('structure-context-content');
    if (!modal || !content) return;
    modal.classList.add('opacity-0');
    content.classList.remove('translate-y-0');
    content.classList.add('translate-y-full');
    setTimeout(() => {
        modal.classList.add('hidden');
        inspectedStructure = null;
    }, 300);
}

function destroySelectedStructure() {
    if (!inspectedStructure) return;

    let refundWood = inspectedStructure.type === 'wall' ? 4 : (inspectedStructure.type === 'campfire' ? 12 : 24);
    let refundStone = inspectedStructure.type === 'wall' ? 1 : (inspectedStructure.type === 'campfire' ? 8 : 20);

    gameState.survivalData.wood = (gameState.survivalData.wood || 0) + refundWood;
    gameState.survivalData.stone = (gameState.survivalData.stone || 0) + refundStone;

    gameState.survivalData.structures = gameState.survivalData.structures.filter(s => s !== inspectedStructure);
    spawnSurvivalFloatingText(inspectedStructure.x, inspectedStructure.y, `+${refundWood}🪵 +${refundStone}🪨`, '#fbbf24');
    
    closeStructureContext();
    updateSurvivalHUD();
    localStorage.setItem('pokeSave', JSON.stringify(gameState));
    showSurvivalToast(`🗑️ Dismantled (+${refundWood}🪵 +${refundStone}🪨 refunded)`, 2000);
}

function moveSelectedStructure() {
    if (!inspectedStructure) return;
    let sType = inspectedStructure.type;

    // Remove old structure and enter build mode without resource cost
    gameState.survivalData.structures = gameState.survivalData.structures.filter(s => s !== inspectedStructure);
    closeStructureContext();
    setBuildItem(sType);
}

function setExtendCount(val) {
    wallExtendCount = val;
    [1, 3, 5].forEach(num => {
        const btn = document.getElementById(`ext-cnt-${num}`);
        if (btn) {
            btn.className = (num === val) 
                ? 'px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500 text-black' 
                : 'px-2 py-0.5 rounded-lg text-[10px] font-bold bg-gray-700 text-gray-300';
        }
    });
}

function extendWallsDirection(dir) {
    if (!inspectedStructure) return;

    let dx = 0;
    let dy = 0;
    if (dir === 'up') dy = -GRID_SIZE;
    if (dir === 'down') dy = GRID_SIZE;
    if (dir === 'left') dx = -GRID_SIZE;
    if (dir === 'right') dx = GRID_SIZE;

    let placedCount = 0;
    let currentX = inspectedStructure.x;
    let currentY = inspectedStructure.y;

    for (let i = 0; i < wallExtendCount; i++) {
        currentX += dx;
        currentY += dy;

        let wood = gameState.survivalData?.wood || 0;
        let stone = gameState.survivalData?.stone || 0;

        if (wood >= 5 && stone >= 2) {
            let isOccupied = gameState.survivalData.structures.some(s => s.x === currentX && s.y === currentY);
            if (!isOccupied) {
                gameState.survivalData.wood -= 5;
                gameState.survivalData.stone -= 2;
                gameState.survivalData.structures.push({
                    id: 'struct_' + Date.now() + '_' + i,
                    type: 'wall',
                    x: currentX,
                    y: currentY,
                    hp: 100,
                    maxHp: 100,
                    workerRosterIndex: null,
                    lastTick: Date.now()
                });
                placedCount++;
            }
        } else {
            break;
        }
    }

    closeStructureContext();
    updateSurvivalHUD();
    checkQuestProgress();
    localStorage.setItem('pokeSave', JSON.stringify(gameState));

    if (placedCount > 0) {
        showSurvivalToast(`✨ Extended +${placedCount} Walls ${dir.toUpperCase()}!`, 2000);
        if (navigator.vibrate) navigator.vibrate(30);
    } else {
        showSurvivalToast("❌ Not enough materials to extend!", 2000);
    }
}

// --- 8. DRAWING GRAPHICS & HEALTH BARS ---
function drawTerrainDetails() {
    survivalCtx.fillStyle = '#064e3b';
    survivalCtx.fillRect(playerX - survivalCanvas.width, playerY - survivalCanvas.height, survivalCanvas.width * 2, survivalCanvas.height * 2);

    worldDecorations.forEach(d => {
        if (Math.abs(playerX - d.x) < survivalCanvas.width && Math.abs(playerY - d.y) < survivalCanvas.height) {
            survivalCtx.fillStyle = d.color;
            survivalCtx.beginPath();
            survivalCtx.arc(d.x, d.y, d.type === 'flower' ? 3 : 2, 0, Math.PI * 2);
            survivalCtx.fill();
        }
    });
}

function drawWorldGrid() {
    survivalCtx.strokeStyle = 'rgba(52, 211, 153, 0.08)';
    survivalCtx.lineWidth = 1;
    let startX = Math.floor((playerX - survivalCanvas.width) / GRID_SIZE) * GRID_SIZE;
    let startY = Math.floor((playerY - survivalCanvas.height) / GRID_SIZE) * GRID_SIZE;

    for (let x = startX; x < playerX + survivalCanvas.width; x += GRID_SIZE) {
        survivalCtx.beginPath();
        survivalCtx.moveTo(x, playerY - survivalCanvas.height);
        survivalCtx.lineTo(x, playerY + survivalCanvas.height);
        survivalCtx.stroke();
    }
    for (let y = startY; y < playerY + survivalCanvas.height; y += GRID_SIZE) {
        survivalCtx.beginPath();
        survivalCtx.moveTo(playerX - survivalCanvas.width, y);
        survivalCtx.lineTo(playerX + survivalCanvas.width, y);
        survivalCtx.stroke();
    }
}

function drawHologramBlueprint() {
    if (!activeBuildItem) return;

    let sx = buildCursor.snapX;
    let sy = buildCursor.snapY;
    let isValid = buildCursor.isValid;

    survivalCtx.save();
    survivalCtx.lineWidth = 2;
    survivalCtx.strokeStyle = isValid ? '#4ade80' : '#ef4444';
    survivalCtx.fillStyle = isValid ? 'rgba(74, 222, 128, 0.35)' : 'rgba(239, 68, 68, 0.35)';

    if (activeBuildItem === 'wall') {
        survivalCtx.fillRect(sx - 20, sy - 20, 40, 40);
        survivalCtx.strokeRect(sx - 20, sy - 20, 40, 40);
    } else if (activeBuildItem === 'campfire') {
        survivalCtx.beginPath();
        survivalCtx.arc(sx, sy, 18, 0, Math.PI * 2);
        survivalCtx.fill();
        survivalCtx.stroke();
    } else if (activeBuildItem === 'pokesquare') {
        survivalCtx.fillRect(sx - 28, sy - 28, 56, 56);
        survivalCtx.strokeRect(sx - 28, sy - 28, 56, 56);
    }

    survivalCtx.setLineDash([4, 4]);
    survivalCtx.beginPath();
    survivalCtx.moveTo(playerX, playerY);
    survivalCtx.lineTo(sx, sy);
    survivalCtx.stroke();
    survivalCtx.restore();
}

function drawWorldStructures() {
    let structures = (gameState.survivalData && gameState.survivalData.structures) || [];

    structures.forEach(s => {
        if (s.type === 'wall') {
            survivalCtx.fillStyle = '#78350f';
            survivalCtx.fillRect(s.x - 20, s.y - 20, 40, 40);
            survivalCtx.strokeStyle = '#451a03';
            survivalCtx.lineWidth = 2;
            survivalCtx.strokeRect(s.x - 20, s.y - 20, 40, 40);

            // Wood Grain
            survivalCtx.fillStyle = '#92400e';
            survivalCtx.fillRect(s.x - 16, s.y - 14, 32, 4);
            survivalCtx.fillRect(s.x - 16, s.y + 8, 32, 4);

            // Wall Health Bar
            let hpRatio = Math.max(0, s.hp / (s.maxHp || 100));
            survivalCtx.fillStyle = 'rgba(0,0,0,0.6)';
            survivalCtx.fillRect(s.x - 16, s.y - 25, 32, 3);
            survivalCtx.fillStyle = hpRatio > 0.4 ? '#22c55e' : '#ef4444';
            survivalCtx.fillRect(s.x - 16, s.y - 25, 32 * hpRatio, 3);
        } else if (s.type === 'campfire') {
            survivalCtx.fillStyle = '#64748b';
            survivalCtx.beginPath();
            survivalCtx.arc(s.x, s.y, 18, 0, Math.PI * 2);
            survivalCtx.fill();
            survivalCtx.fillStyle = '#ea580c';
            survivalCtx.beginPath();
            survivalCtx.arc(s.x, s.y, 10, 0, Math.PI * 2);
            survivalCtx.fill();
            survivalCtx.fillStyle = '#fde047';
            survivalCtx.beginPath();
            survivalCtx.arc(s.x, s.y, 5, 0, Math.PI * 2);
            survivalCtx.fill();
        } else if (s.type === 'pokesquare') {
            survivalCtx.fillStyle = '#1e3a8a';
            survivalCtx.fillRect(s.x - 28, s.y - 28, 56, 56);
            survivalCtx.strokeStyle = '#60a5fa';
            survivalCtx.lineWidth = 3;
            survivalCtx.strokeRect(s.x - 28, s.y - 28, 56, 56);

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

function drawWorldResources() {
    worldTrees.forEach(t => {
        survivalCtx.fillStyle = '#166534';
        survivalCtx.beginPath();
        survivalCtx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
        survivalCtx.fill();
        survivalCtx.strokeStyle = '#14532d';
        survivalCtx.lineWidth = 2.5;
        survivalCtx.stroke();
    });

    worldRocks.forEach(r => {
        survivalCtx.fillStyle = '#64748b';
        survivalCtx.beginPath();
        survivalCtx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        survivalCtx.fill();
        survivalCtx.strokeStyle = '#334155';
        survivalCtx.lineWidth = 2.5;
        survivalCtx.stroke();
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
    survivalCtx.arc(playerX, playerY, 15, 0, Math.PI * 2);
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

// --- 9. HOSTILE AI ATTACKS WALLS & PLAYER ---
function updateCompanionAI() {
    let dist = Math.hypot(playerX - companionPos.x, playerY - companionPos.y);
    if (dist > 45) {
        let angle = Math.atan2(playerY - companionPos.y, playerX - companionPos.x);
        let nextX = companionPos.x + Math.cos(angle) * (playerSpeed * 1.05);
        let nextY = companionPos.y + Math.sin(angle) * (playerSpeed * 1.05);
        if (!checkWallCollision(nextX, nextY, 12)) {
            companionPos.x = nextX;
            companionPos.y = nextY;
        }
    }

    if (companionAttackCooldown > 0) {
        companionAttackCooldown--;
        return;
    }

    for (let e of wildEnemies) {
        let eDist = Math.hypot(companionPos.x - e.x, companionPos.y - e.y);
        if (eDist < 75) {
            let dmg = Math.max(15, Math.floor((gameState.attack || 10) * 1.2));
            e.hp -= dmg;
            spawnSurvivalFloatingText(e.x, e.y - 15, `-${dmg}`, '#ef4444');
            companionAttackCooldown = 30;
            break;
        }
    }
}

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
            let nextX = e.x + Math.cos(angle) * e.speed;
            let nextY = e.y + Math.sin(angle) * e.speed;

            // Check if blocked by a wall
            let hitWall = checkWallCollision(nextX, nextY, 14);
            if (hitWall) {
                // Attack the wall!
                if (!e.attackCooldown || e.attackCooldown <= 0) {
                    hitWall.hp = Math.max(0, hitWall.hp - 10);
                    spawnSurvivalFloatingText(hitWall.x, hitWall.y - 10, '-10 HP', '#f87171');
                    e.attackCooldown = 40; // 0.65s attack interval

                    if (hitWall.hp <= 0) {
                        gameState.survivalData.structures = gameState.survivalData.structures.filter(s => s !== hitWall);
                        spawnSurvivalFloatingText(hitWall.x, hitWall.y, '💥 BROKEN!', '#ef4444');
                    }
                } else {
                    e.attackCooldown--;
                }
            } else {
                e.x = nextX;
                e.y = nextY;
                if (e.attackCooldown > 0) e.attackCooldown--;

                if (dist < 26) {
                    playerHp = Math.max(0, playerHp - 0.35);
                    if (playerHp <= 0) {
                        showModal("💀 RESCUED!", "Your companion carried you back to safety!");
                        leaveSurvivalMode();
                        return;
                    }
                }
            }
        }
    }
}

// --- 10. HARVESTING ACTION & TOASTS ---
function showSurvivalToast(msg, duration = 1800) {
    const toast = document.getElementById('survival-toast');
    if (!toast) return;
    toast.innerText = msg;
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, duration);
}

function updateQuestUI() {
    let q = SURVIVAL_QUESTS[currentSurvivalQuest] || SURVIVAL_QUESTS[SURVIVAL_QUESTS.length - 1];
    const titleEl = document.getElementById('quest-title');
    const descEl = document.getElementById('quest-desc');
    if (titleEl) titleEl.innerText = `Objective: ${q.title}`;
    if (descEl) descEl.innerText = `${q.desc} (+${q.reward} XP)`;
}

function checkQuestProgress() {
    let q = SURVIVAL_QUESTS[currentSurvivalQuest];
    if (q && q.check()) {
        currentSurvivalQuest++;
        showSurvivalToast(`🎉 Quest Complete: ${q.title}! (+${q.reward} XP)`, 3000);
        addXP(q.reward, false);
        updateQuestUI();
    }
}

function openSurvivalGuideModal() {
    const modal = document.getElementById('survival-guide-modal');
    const content = document.getElementById('survival-guide-content');
    if (!modal || !content) return;
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        content.classList.remove('scale-95');
        content.classList.add('scale-100');
    }, 10);
}

function closeSurvivalGuideModal() {
    const modal = document.getElementById('survival-guide-modal');
    const content = document.getElementById('survival-guide-content');
    if (!modal || !content) return;
    modal.classList.add('opacity-0');
    content.classList.remove('scale-100');
    content.classList.add('scale-95');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

function playerHarvestAction() {
    let targetTree = worldTrees.find(t => Math.hypot(playerX - t.x, playerY - t.y) < 60);
    if (targetTree) {
        targetTree.hp -= 25;
        gameState.survivalData.wood = (gameState.survivalData.wood || 0) + 5;
        spawnSurvivalFloatingText(targetTree.x, targetTree.y - 15, '+5 🪵 Wood', '#f59e0b');
        if (targetTree.hp <= 0) {
            worldTrees = worldTrees.filter(t => t !== targetTree);
        }
        if (navigator.vibrate) navigator.vibrate(25);
        updateSurvivalHUD();
        checkQuestProgress();
        return;
    }

    let targetRock = worldRocks.find(r => Math.hypot(playerX - r.x, playerY - r.y) < 60);
    if (targetRock) {
        targetRock.hp -= 25;
        gameState.survivalData.stone = (gameState.survivalData.stone || 0) + 5;
        spawnSurvivalFloatingText(targetRock.x, targetRock.y - 15, '+5 🪨 Stone', '#94a3b8');
        if (targetRock.hp <= 0) {
            worldRocks = worldRocks.filter(r => r !== targetRock);
        }
        if (navigator.vibrate) navigator.vibrate(25);
        updateSurvivalHUD();
        checkQuestProgress();
        return;
    }

    showSurvivalToast("🔍 Move closer to a tree or rock to gather!", 1500);
}

// --- 11. COOKING & WORKER AUTOMATION ---
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

    let wood = gameState.survivalData?.wood || 0;
    let stone = gameState.survivalData?.stone || 0;
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
                <button onclick="cookSuperBerry('${key}')" class="px-3 py-1.5 ${canCook ? 'bg-amber-600 hover:bg-amber-500 active:scale-90' : 'bg-gray-700 cursor-not-allowed'} text-white font-bold rounded-lg text-xs shadow transition-all">
                    Cook 🍳
                </button>
            </div>
        `;
    });
}

function cookSuperBerry(key) {
    let r = COOKING_RECIPES[key];
    if (!r) return;

    let wood = gameState.survivalData?.wood || 0;
    let stone = gameState.survivalData?.stone || 0;
    let berries = gameState.berries || 0;

    if (wood >= r.woodCost && stone >= r.stoneCost && berries >= r.berryCost) {
        gameState.survivalData.wood -= r.woodCost;
        gameState.survivalData.stone -= r.stoneCost;
        gameState.berries -= r.berryCost;

        let statKey = r.stat;
        let gain = Math.max(2, Math.floor((gameState[statKey] || 10) * r.mult));
        gameState[statKey] += gain;

        if (typeof syncCurrentPokemonToRoster === 'function') syncCurrentPokemonToRoster();
        localStorage.setItem('pokeSave', JSON.stringify(gameState));

        renderCookingRecipeList();
        updateSurvivalHUD();
        updateHub();
        checkQuestProgress();

        showSurvivalToast(`🍲 Cooked ${r.name}! (+${gain} ${statKey.toUpperCase()})`, 2500);
        if (navigator.vibrate) navigator.vibrate(30);
    } else {
        showSurvivalToast("❌ Insufficient Materials!", 1500);
    }
}

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
                        <p class="text-[9px] text-gray-400">Lv. ${p.level} • Role: Passive Resource Foraging</p>
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
    checkQuestProgress();
    showSurvivalToast(`👷 ${gameState.roster[rosterIndex].name} assigned to Base!`, 2500);
}

function updateBaseWorkerTick() {
    if (!gameState.survivalData?.structures) return;

    let now = Date.now();
    gameState.survivalData.structures.forEach(s => {
        if (s.type === 'pokesquare' && s.workerRosterIndex !== null && s.workerRosterIndex !== undefined) {
            if (now - (s.lastTick || now) > 60000) {
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
    if (!gameState.survivalData?.structures) return;

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
        showSurvivalToast(`📦 Base Harvest: +${totalWood}🪵 +${totalStone}🪨 +${totalBerries}🍓!`, 3000);
    }
}

// --- 12. HUD OVERLAYS ---
function updateSurvivalHUD() {
    const woodEl = document.getElementById('survive-wood');
    const stoneEl = document.getElementById('survive-stone');
    const hpBar = document.getElementById('survive-hp-bar');
    const hpText = document.getElementById('survive-hp-text');

    let wood = gameState.survivalData?.wood || 0;
    let stone = gameState.survivalData?.stone || 0;

    if (woodEl) woodEl.innerText = formatNumber(wood);
    if (stoneEl) stoneEl.innerText = formatNumber(stone);
    if (hpBar) hpBar.style.width = `${Math.max(0, (playerHp / playerMaxHp) * 100)}%`;
    if (hpText) hpText.innerText = `${Math.floor(playerHp)}/${playerMaxHp}`;
}