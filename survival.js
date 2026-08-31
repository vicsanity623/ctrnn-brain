// ============================================================================
// 🌲 POKE-SURVIVAL 2D OPEN-WORLD RPG & BUILDING ENGINE (survival.js)
// ============================================================================

var survivalCanvas, survivalCtx;
var survivalAnimId = null;
var isSurvivalRunning = false;

// Player & World State
var playerX = 5000; // Center of 10,000 x 10,000 world
var playerY = 5000;
var playerSpeed = 3.5;
var playerHp = 100;
var playerMaxHp = 100;
var playerStamina = 100;
var playerMaxStamina = 100;
var pokeCoins = 0;

// Inventory & Resources
var survivalInventory = {
    wood: 25,
    stone: 15,
    berries: 10
};

// World Entities
var worldTrees = [];
var worldRocks = [];
var worldStructures = []; // { type, x, y, hp }
var wildEnemies = [];
var assignedWorkers = []; // { rosterIndex, task: 'gather' | 'defend' }

// Build Mode State
var activeBuildItem = null; // 'wall', 'campfire', 'workbench', 'pokesquare'

// Input Keys
var keysPressed = {};
var touchJoystick = { active: false, startX: 0, startY: 0, dx: 0, dy: 0 };

// --- 1. INITIALIZE SURVIVAL MODE ---
function openSurvivalMode() {
    showScreen('survival-screen');
    initSurvivalCanvas();
    generateWorldNodes();

    if (!isSurvivalRunning) {
        isSurvivalRunning = true;
        initSurvivalControls();
        if (survivalAnimId) cancelAnimationFrame(survivalAnimId);
        survivalAnimId = requestAnimationFrame(survivalGameLoop);
    }
}

function leaveSurvivalMode() {
    isSurvivalRunning = false;
    if (survivalAnimId) cancelAnimationFrame(survivalAnimId);
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

// --- 2. PROCEDURAL RESOURCE GENERATION (10,000 x 10,000 MAP) ---
function generateWorldNodes() {
    if (worldTrees.length > 0) return; // Only generate once per session

    // Spawn 300 Trees & 200 Rocks around the starting area
    for (let i = 0; i < 300; i++) {
        worldTrees.push({
            x: Math.random() * 8000 + 1000,
            y: Math.random() * 8000 + 1000,
            hp: 50,
            maxHp: 50,
            radius: 24
        });
    }

    for (let i = 0; i < 200; i++) {
        worldRocks.push({
            x: Math.random() * 8000 + 1000,
            y: Math.random() * 8000 + 1000,
            hp: 80,
            maxHp: 80,
            radius: 20
        });
    }

    // Spawn initial roaming wild shadows
    for (let i = 0; i < 25; i++) {
        spawnWildSurvivalEnemy();
    }
}

function spawnWildSurvivalEnemy() {
    let angle = Math.random() * Math.PI * 2;
    let dist = 400 + Math.random() * 600;
    wildEnemies.push({
        id: Math.floor(Math.random() * 150) + 1,
        x: playerX + Math.cos(angle) * dist,
        y: playerY + Math.sin(angle) * dist,
        hp: 120,
        maxHp: 120,
        damage: 15,
        speed: 1.8,
        state: 'wander' // wander, chase, attack
    });
}

// ============================================================================
// 3. MAIN 60 FPS SURVIVAL GAME LOOP
// ============================================================================
function survivalGameLoop() {
    if (!isSurvivalRunning) return;

    survivalCtx.clearRect(0, 0, survivalCanvas.width, survivalCanvas.height);

    // Update Player Movement
    updatePlayerMovement();

    // Update World Entities AI
    updateSurvivalEnemies();
    updateAssignedWorkers();

    // Render World (Camera locked on player)
    survivalCtx.save();
    let camX = survivalCanvas.width / 2 - playerX;
    let camY = survivalCanvas.height / 2 - playerY;
    survivalCtx.translate(camX, camY);

    drawWorldGrid();
    drawWorldStructures();
    drawWorldResources();
    drawWildEnemies();
    drawPlayerAndCompanion();

    survivalCtx.restore();

    // Render UI Overlays & Hotbar
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

    playerX += vx;
    playerY += vy;

    // World Map Boundaries (10,000 x 10,000)
    playerX = Math.max(100, Math.min(9900, playerX));
    playerY = Math.max(100, Math.min(9900, playerY));

    // Stamina regeneration
    if (vx === 0 && vy === 0 && playerStamina < playerMaxStamina) {
        playerStamina = Math.min(playerMaxStamina, playerStamina + 0.5);
    }
}

function initSurvivalControls() {
    window.addEventListener('keydown', e => { keysPressed[e.key.toLowerCase()] = true; });
    window.addEventListener('keyup', e => { keysPressed[e.key.toLowerCase()] = false; });

    let joystickArea = document.getElementById('survival-joystick-area');
    if (!joystickArea) return;

    joystickArea.addEventListener('touchstart', e => {
        touchJoystick.active = true;
        let touch = e.touches[0];
        touchJoystick.startX = touch.clientX;
        touchJoystick.startY = touch.clientY;
    });

    joystickArea.addEventListener('touchmove', e => {
        if (!touchJoystick.active) return;
        let touch = e.touches[0];
        let dx = touch.clientX - touchJoystick.startX;
        let dy = touch.clientY - touchJoystick.startY;
        let dist = Math.hypot(dx, dy);
        if (dist > 0) {
            touchJoystick.dx = dx / Math.max(dist, 40);
            touchJoystick.dy = dy / Math.max(dist, 40);
        }
    });

    joystickArea.addEventListener('touchend', () => {
        touchJoystick.active = false;
        touchJoystick.dx = 0;
        touchJoystick.dy = 0;
    });
}

// --- RENDER WORLD GRAPHICS ---
function drawWorldGrid() {
    survivalCtx.strokeStyle = 'rgba(34, 197, 94, 0.08)';
    survivalCtx.lineWidth = 1;
    let gridSize = 100;
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
    // Draw Trees
    worldTrees.forEach(t => {
        survivalCtx.fillStyle = '#166534';
        survivalCtx.beginPath();
        survivalCtx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
        survivalCtx.fill();
        survivalCtx.strokeStyle = '#14532d';
        survivalCtx.lineWidth = 3;
        survivalCtx.stroke();

        // Trunk
        survivalCtx.fillStyle = '#78350f';
        survivalCtx.fillRect(t.x - 6, t.y - 6, 12, 12);
    });

    // Draw Rocks
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
    worldStructures.forEach(s => {
        if (s.type === 'wall') {
            survivalCtx.fillStyle = '#7c2d12';
            survivalCtx.fillRect(s.x - 20, s.y - 20, 40, 40);
            survivalCtx.strokeStyle = '#451a03';
            survivalCtx.lineWidth = 3;
            survivalCtx.strokeRect(s.x - 20, s.y - 20, 40, 40);
        } else if (s.type === 'campfire') {
            survivalCtx.fillStyle = '#ea580c';
            survivalCtx.beginPath();
            survivalCtx.arc(s.x, s.y, 16, 0, Math.PI * 2);
            survivalCtx.fill();
        } else if (s.type === 'pokesquare') {
            survivalCtx.fillStyle = '#3b82f6';
            survivalCtx.fillRect(s.x - 30, s.y - 30, 60, 60);
            survivalCtx.strokeStyle = '#1d4ed8';
            survivalCtx.lineWidth = 4;
            survivalCtx.strokeRect(s.x - 30, s.y - 30, 60, 60);
        }
    });
}

function drawWildEnemies() {
    wildEnemies.forEach(e => {
        let sprite = getCachedSprite(e.id);
        if (sprite && sprite.complete) {
            survivalCtx.drawImage(sprite, e.x - 20, e.y - 20, 40, 40);
        }
    });
}

function drawPlayerAndCompanion() {
    // Draw Active Companion Following Player
    let companionSprite = getCachedSprite(gameState.id || 1);
    if (companionSprite && companionSprite.complete) {
        survivalCtx.drawImage(companionSprite, playerX - 45, playerY - 15, 36, 36);
    }

    // Draw Player Avatar (Trainer Circle)
    survivalCtx.fillStyle = '#3b82f6';
    survivalCtx.beginPath();
    survivalCtx.arc(playerX, playerY, 18, 0, Math.PI * 2);
    survivalCtx.fill();
    survivalCtx.strokeStyle = '#ffffff';
    survivalCtx.lineWidth = 3;
    survivalCtx.stroke();
}

// --- SURVIVAL COMBAT & ENTITY AI ---
function updateSurvivalEnemies() {
    wildEnemies.forEach(e => {
        let dist = Math.hypot(playerX - e.x, playerY - e.y);
        if (dist < 350) {
            // Chase player
            let angle = Math.atan2(playerY - e.y, playerX - e.x);
            e.x += Math.cos(angle) * e.speed;
            e.y += Math.sin(angle) * e.speed;

            if (dist < 25) {
                playerHp = Math.max(0, playerHp - 0.5); // Real-time contact damage
            }
        }
    });
}

function updateAssignedWorkers() {
    // Workers automatically gather resources or defend base if nearby
}

// --- INTERACTION & GATHERING ACTIONS ---
function playerHarvestAction() {
    // Check nearest tree or rock
    let targetTree = worldTrees.find(t => Math.hypot(playerX - t.x, playerY - t.y) < 55);
    if (targetTree) {
        targetTree.hp -= 25;
        survivalInventory.wood += 5;
        if (targetTree.hp <= 0) {
            worldTrees = worldTrees.filter(t => t !== targetTree);
        }
        if (navigator.vibrate) navigator.vibrate(25);
        return;
    }

    let targetRock = worldRocks.find(r => Math.hypot(playerX - r.x, playerY - r.y) < 55);
    if (targetRock) {
        targetRock.hp -= 25;
        survivalInventory.stone += 5;
        if (targetRock.hp <= 0) {
            worldRocks = worldRocks.filter(r => r !== targetRock);
        }
        if (navigator.vibrate) navigator.vibrate(25);
        return;
    }
}

function setBuildItem(type) {
    activeBuildItem = type;
    showModal("🏗️ Build Mode", `Selected: ${type.toUpperCase()}. Tap anywhere in the open world to place!`);
}

function playerBuildAtTouch(worldTouchX, worldTouchY) {
    if (!activeBuildItem) return;

    let costWood = activeBuildItem === 'wall' ? 5 : 20;
    let costStone = activeBuildItem === 'wall' ? 1 : 10;

    if (survivalInventory.wood >= costWood && survivalInventory.stone >= costStone) {
        survivalInventory.wood -= costWood;
        survivalInventory.stone -= costStone;

        worldStructures.push({
            type: activeBuildItem,
            x: worldTouchX,
            y: worldTouchY,
            hp: 100
        });

        activeBuildItem = null;
        showModal("Success!", "Structure built successfully!");
    } else {
        showModal("Not enough materials!", `Need ${costWood} Wood and ${costStone} Stone.`);
    }
}

// --- HUD & INVENTORY OVERLAYS ---
function updateSurvivalHUD() {
    const woodEl = document.getElementById('survive-wood');
    const stoneEl = document.getElementById('survive-stone');
    const hpBar = document.getElementById('survive-hp-bar');

    if (woodEl) woodEl.innerText = survivalInventory.wood;
    if (stoneEl) stoneEl.innerText = survivalInventory.stone;
    if (hpBar) hpBar.style.width = `${(playerHp / playerMaxHp) * 100}%`;
}