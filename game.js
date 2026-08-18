// --- 18 OFFICIAL ELEMENTAL TYPE DATABASE ---
const TYPE_DATABASE = {
    normal: { name: "Normal", icon: "⭐", bg: "bg-gray-600", superVs: [], weakVs: ["fighting"],
        moves: [
            { name: "💥 Tackle", type: "physical", desc: "Physical" },
            { name: "🗣️ Growl", type: "status", desc: "Shreds Stats" },
            { name: "✨ Swift", type: "special", desc: "Lv. 7 (Sp. Atk)", power: 1.3 },
            { name: "🌟 Hyper Beam", type: "ultimate", desc: "Lv. 13 Heavy Dmg", power: 2.0 }
        ]},
    fire: { name: "Fire", icon: "🔥", bg: "bg-red-600", superVs: ["grass", "ice", "bug", "steel"], weakVs: ["water", "ground", "rock"],
        moves: [
            { name: "🔥 Scratch", type: "physical", desc: "Physical" },
            { name: "💨 Smokescreen", type: "status", desc: "Shreds Stats" },
            { name: "🔥 Flame Burst", type: "special", desc: "Lv. 7 (Sp. Atk)", power: 1.4 },
            { name: "☄️ Fire Blast", type: "ultimate", desc: "Lv. 13 High Crit", power: 1.9 }
        ]},
    water: { name: "Water", icon: "💧", bg: "bg-blue-600", superVs: ["fire", "ground", "rock"], weakVs: ["electric", "grass"],
        moves: [
            { name: "💧 Water Gun", type: "physical", desc: "Physical" },
            { name: "🌊 Withdraw", type: "status", desc: "Boosts Armor" },
            { name: "💦 Water Pulse", type: "special", desc: "Lv. 7 (Sp. Atk)", power: 1.35 },
            { name: "🌊 Hydro Pump", type: "ultimate", desc: "Lv. 13 Heavy Dmg", power: 2.0 }
        ]},
    grass: { name: "Grass", icon: "🌿", bg: "bg-green-600", superVs: ["water", "ground", "rock"], weakVs: ["fire", "ice", "poison", "flying", "bug"],
        moves: [
            { name: "💥 Tackle", type: "physical", desc: "Physical" },
            { name: "🗣️ Growl", type: "status", desc: "Shreds Stats" },
            { name: "🌿 Vine Whip", type: "special", desc: "Lv. 7 (Sp. Atk)", power: 1.35 },
            { name: "🌱 Leech Seed", type: "ultimate", desc: "Lv. 13 Drain HP", power: 1.5 }
        ]},
    electric: { name: "Electric", icon: "⚡", bg: "bg-yellow-500 text-black", superVs: ["water", "flying"], weakVs: ["ground"],
        moves: [
            { name: "⚡ Spark", type: "physical", desc: "Physical" },
            { name: "🔊 Screech", type: "status", desc: "Shreds Stats" },
            { name: "⚡ Shock Wave", type: "special", desc: "Lv. 7 (Sp. Atk)", power: 1.4 },
            { name: "🌩️ Thunderbolt", type: "ultimate", desc: "Lv. 13 High Crit", power: 1.95 }
        ]},
    bug: { name: "Bug", icon: "🐛", bg: "bg-lime-600", superVs: ["grass", "psychic", "dark"], weakVs: ["fire", "flying", "rock"],
        moves: [
            { name: "📌 Fury Attack", type: "physical", desc: "Physical" },
            { name: "🕸️ String Shot", type: "status", desc: "Shreds Stats" },
            { name: "🪲 Pin Missile", type: "special", desc: "Lv. 7 (Sp. Atk)", power: 1.3 },
            { name: "🐝 Bug Buzz", type: "ultimate", desc: "Lv. 13 Heavy Dmg", power: 1.85 }
        ]},
    poison: { name: "Poison", icon: "🧪", bg: "bg-purple-600", superVs: ["grass", "fairy"], weakVs: ["ground", "psychic"],
        moves: [
            { name: "🧪 Poison Sting", type: "physical", desc: "Physical" },
            { name: "💨 Toxic Gas", type: "status", desc: "Shreds Stats" },
            { name: "🟣 Sludge", type: "special", desc: "Lv. 7 (Sp. Atk)", power: 1.35 },
            { name: "☣️ Sludge Bomb", type: "ultimate", desc: "Lv. 13 Drain HP", power: 1.7 }
        ]},
    fighting: { name: "Fighting", icon: "🥊", bg: "bg-amber-800", superVs: ["normal", "ice", "rock", "dark", "steel"], weakVs: ["flying", "psychic", "fairy"],
        moves: [
            { name: "🥊 Karate Chop", type: "physical", desc: "Physical" },
            { name: "😤 Bulk Up", type: "status", desc: "Shreds Stats" },
            { name: "🥋 Brick Break", type: "special", desc: "Lv. 7 (Sp. Atk)", power: 1.35 },
            { name: "💥 Close Combat", type: "ultimate", desc: "Lv. 13 Heavy Dmg", power: 2.1 }
        ]},
    psychic: { name: "Psychic", icon: "🔮", bg: "bg-pink-600", superVs: ["fighting", "poison"], weakVs: ["bug", "ghost", "dark"],
        moves: [
            { name: "👁️ Confusion", type: "physical", desc: "Physical" },
            { name: "💫 Hypnosis", type: "status", desc: "Shreds Stats" },
            { name: "🔮 Psybeam", type: "special", desc: "Lv. 7 (Sp. Atk)", power: 1.4 },
            { name: "🧠 Psychic", type: "ultimate", desc: "Lv. 13 Heavy Dmg", power: 2.0 }
        ]},
    ground: { name: "Ground", icon: "🏜️", bg: "bg-yellow-700", superVs: ["fire", "electric", "poison", "rock", "steel"], weakVs: ["water", "grass", "ice"],
        moves: [
            { name: "🪨 Mud-Slap", type: "physical", desc: "Physical" },
            { name: "🏜️ Sand Attack", type: "status", desc: "Shreds Stats" },
            { name: "💥 Bulldoze", type: "special", desc: "Lv. 7 (Sp. Atk)", power: 1.35 },
            { name: "🌋 Earthquake", type: "ultimate", desc: "Lv. 13 Heavy Dmg", power: 2.0 }
        ]},
    rock: { name: "Rock", icon: "🪨", bg: "bg-yellow-800", superVs: ["fire", "ice", "flying", "bug"], weakVs: ["water", "grass", "fighting", "ground", "steel"],
        moves: [
            { name: "🪨 Rock Throw", type: "physical", desc: "Physical" },
            { name: "🛡️ Harden", type: "status", desc: "Shreds Stats" },
            { name: "🪨 Rock Tomb", type: "special", desc: "Lv. 7 (Sp. Atk)", power: 1.35 },
            { name: "🗿 Rock Slide", type: "ultimate", desc: "Lv. 13 High Crit", power: 1.9 }
        ]},
    flying: { name: "Flying", icon: "🪽", bg: "bg-indigo-400", superVs: ["grass", "fighting", "bug"], weakVs: ["electric", "ice", "rock"],
        moves: [
            { name: "🪽 Gust", type: "physical", desc: "Physical" },
            { name: "🌪️ Whirlwind", type: "status", desc: "Shreds Stats" },
            { name: "🪽 Wing Attack", type: "special", desc: "Lv. 7 (Sp. Atk)", power: 1.35 },
            { name: "🦅 Brave Bird", type: "ultimate", desc: "Lv. 13 Heavy Dmg", power: 2.0 }
        ]},
    ghost: { name: "Ghost", icon: "👻", bg: "bg-purple-900", superVs: ["psychic", "ghost"], weakVs: ["ghost", "dark"],
        moves: [
            { name: "👻 Lick", type: "physical", desc: "Physical" },
            { name: "👁️ Spite", type: "status", desc: "Shreds Stats" },
            { name: "🔮 Shadow Sneak", type: "special", desc: "Lv. 7 (Sp. Atk)", power: 1.35 },
            { name: "💀 Shadow Ball", type: "ultimate", desc: "Lv. 13 Heavy Dmg", power: 1.9 }
        ]},
    ice: { name: "Ice", icon: "❄️", bg: "bg-cyan-500", superVs: ["grass", "ground", "flying", "dragon"], weakVs: ["fire", "fighting", "rock", "steel"],
        moves: [
            { name: "❄️ Powder Snow", type: "physical", desc: "Physical" },
            { name: "💨 Mist", type: "status", desc: "Shreds Stats" },
            { name: "🧊 Ice Shard", type: "special", desc: "Lv. 7 (Sp. Atk)", power: 1.35 },
            { name: "🌨️ Blizzard", type: "ultimate", desc: "Lv. 13 Heavy Dmg", power: 2.0 }
        ]},
    dragon: { name: "Dragon", icon: "🐉", bg: "bg-indigo-800", superVs: ["dragon"], weakVs: ["ice", "dragon", "fairy"],
        moves: [
            { name: "🐉 Dragon Breath", type: "physical", desc: "Physical" },
            { name: "😤 Dragon Dance", type: "status", desc: "Shreds Stats" },
            { name: "🐲 Dragon Claw", type: "special", desc: "Lv. 7 (Sp. Atk)", power: 1.4 },
            { name: "🔥 Outrage", type: "ultimate", desc: "Lv. 13 Heavy Dmg", power: 2.1 }
        ]},
    steel: { name: "Steel", icon: "⚙️", bg: "bg-slate-500", superVs: ["ice", "rock", "fairy"], weakVs: ["fire", "fighting", "ground"],
        moves: [
            { name: "⚙️ Metal Claw", type: "physical", desc: "Physical" },
            { name: "🛡️ Iron Defense", type: "status", desc: "Shreds Stats" },
            { name: "🔩 Flash Cannon", type: "special", desc: "Lv. 7 (Sp. Atk)", power: 1.35 },
            { name: "⚔️ Iron Head", type: "ultimate", desc: "Lv. 13 Heavy Dmg", power: 1.95 }
        ]},
    dark: { name: "Dark", icon: "🌑", bg: "bg-zinc-800", superVs: ["psychic", "ghost"], weakVs: ["fighting", "bug", "fairy"],
        moves: [
            { name: "🌑 Bite", type: "physical", desc: "Physical" },
            { name: "😈 Taunt", type: "status", desc: "Shreds Stats" },
            { name: "🗡️ Night Slash", type: "special", desc: "Lv. 7 (Sp. Atk)", power: 1.35 },
            { name: "🖤 Dark Pulse", type: "ultimate", desc: "Lv. 13 Heavy Dmg", power: 1.9 }
        ]},
    fairy: { name: "Fairy", icon: "✨", bg: "bg-pink-400", superVs: ["fighting", "dragon", "dark"], weakVs: ["poison", "steel"],
        moves: [
            { name: "✨ Fairy Wind", type: "physical", desc: "Physical" },
            { name: "💖 Sweet Kiss", type: "status", desc: "Shreds Stats" },
            { name: "🌸 Draining Kiss", type: "special", desc: "Lv. 7 (Sp. Atk)", power: 1.35 },
            { name: "🌟 Moonblast", type: "ultimate", desc: "Lv. 13 Heavy Dmg", power: 2.0 }
        ]}
};

// Game State
var gameState = {
    id: 1, name: 'Bulbasaur', type: 'grass', level: 5, xp: 0, maxXp: 100, 
    hearts: 2, attack: 10, defense: 10, maxHp: 80,
    spAtk: 12, spDef: 12, speed: 9,
    berries: 5, pokeballs: 3,
    lastInteraction: Date.now(),
    currentStage: 3, maxStage: 3,
    gardenBerries: 1, lastGardenHarvest: Date.now(),
    roster: []
};

// Background Interval: Handles Live Heart Loss & Berry Bush Growth
setInterval(() => {
    const isHubVisible = !document.getElementById('hub-screen').classList.contains('hidden');
    const isTabActive = document.visibilityState === 'visible';

    // Live Heart Depletion (Loses 1 heart every 5 minutes while app is open)
    if (gameState.hearts > 0 && isHubVisible && isTabActive) {
        if ((Date.now() - gameState.lastInteraction) >= 300000) {
            gameState.hearts--;
            gameState.lastInteraction = Date.now();
        }
    }

    // Berry Garden Growth (Now accumulates up to 20 Berries max!)
    if (gameState.gardenBerries < 20 && (Date.now() - gameState.lastGardenHarvest) >= 120000) {
        gameState.gardenBerries = Math.min(20, gameState.gardenBerries + 1);
        gameState.lastGardenHarvest = Date.now();
    }

    if (isHubVisible) updateHub();
}, 15000); // Checks every 15 seconds

// UI Elements
const screens = ['loading-screen', 'main-menu', 'intro-screen', 'hub-screen', 'battle-screen', 'evo-screen'];
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

// Start or Continue
function startGame(isNew) {
    if(!isNew && localStorage.getItem('pokeSave')) {
        gameState = JSON.parse(localStorage.getItem('pokeSave'));
        
        // Backward compatibility for old saves
        if (gameState.berries === undefined) gameState.berries = 5;
        if (gameState.pokeballs === undefined) gameState.pokeballs = 3;
        if (gameState.currentStage === undefined) gameState.currentStage = gameState.enemyLevel || 3;
        if (gameState.maxStage === undefined) gameState.maxStage = gameState.currentStage;
        if (gameState.spAtk === undefined) gameState.spAtk = 12;
        if (gameState.spDef === undefined) gameState.spDef = 12;
        if (gameState.speed === undefined) gameState.speed = 9;
        if (gameState.gardenBerries === undefined) gameState.gardenBerries = 1;
        if (!gameState.lastGardenHarvest) gameState.lastGardenHarvest = Date.now();
        if (!gameState.lastInteraction) gameState.lastInteraction = Date.now();
        if (!gameState.roster || gameState.roster.length === 0) {
            // Add starter to roster if empty
            gameState.roster = [{
                id: gameState.id,
                name: gameState.name,
                level: gameState.level,
                maxHp: gameState.maxHp,
                attack: gameState.attack,
                defense: gameState.defense,
                spAtk: gameState.spAtk,
                spDef: gameState.spDef,
                speed: gameState.speed,
                xp: gameState.xp,
                maxXp: gameState.maxXp
            }];
        }

        // Calculate offline Berry Bush growth (1 berry per 2 minutes offline, max 5)
        let gardenMins = Math.floor((Date.now() - gameState.lastGardenHarvest) / 120000);
        if (gardenMins > 0) {
            gameState.gardenBerries = Math.min(5, gameState.gardenBerries + gardenMins);
            gameState.lastGardenHarvest = Date.now();
        }

        // Gentle Offline Heart Decay (1 heart lost every 30 minutes offline)
        let offlinePeriods = Math.floor((Date.now() - gameState.lastInteraction) / (30 * 60000));
        if (offlinePeriods > 0) {
            gameState.hearts = Math.max(1, gameState.hearts - offlinePeriods); // Never drops below 1 heart!
            gameState.lastInteraction = Date.now();
        }

        // Offline Berry Bush Growth (1 berry per 2 minutes offline, accumulates up to 20!)
        let gardenBerriesGrown = Math.floor((Date.now() - gameState.lastGardenHarvest) / 120000);
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

// Story Sequence
let storyStep = 0;
const storyLines = [
    "Welcome to the world of Pokemon! Your dream to become a Master begins now.",
    "I am the Professor. I'm gifting you this Bulbasaur to start your journey!",
    "Take good care of it. Feed it, pet it, and battle to grow stronger!"
];
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
    document.getElementById('xp-bar').style.width = `${(gameState.xp / gameState.maxXp) * 100}%`;
    document.getElementById('hub-sprite').src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${gameState.id}.gif`;

    // Draw Hearts
    let heartsHtml = '';
    for(let i=0; i<10; i++) {
        heartsHtml += `<span class="text-xl ${i < gameState.hearts ? 'text-red-500' : 'text-gray-600'}">♥</span>`;
    }
    document.getElementById('heart-container').innerHTML = heartsHtml;
    
    // Update Berries & Pokéballs
    if(document.getElementById('berry-count')) {
        document.getElementById('berry-count').innerText = gameState.berries;
    }
    if(document.getElementById('party-count-badge')) {
        document.getElementById('party-count-badge').innerText = (gameState.roster && gameState.roster.length) || 1;
    }

    // Update Idle Berry Bush UI & Fanned Card Stack
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

// --- FANNED 20-BERRY CARD STACK RENDERER ---
function renderBerryStack() {
    const container = document.getElementById('berry-stack-container');
    if (!container) return;
    
    let count = gameState.gardenBerries || 0;
    container.innerHTML = '';

    if (count <= 0) {
        container.innerHTML = `<span class="text-2xl select-none">🌳</span>`;
        return;
    }

    // Fanning Spread Limits (Arched Playing-Card Math)
    let maxSpreadX = 14; // Horizontal span in pixels
    let maxAngle = 36;   // Total rotation fan spread in degrees (-18° to +18°)

    for (let i = 0; i < count; i++) {
        let ratio = count > 1 ? (i / (count - 1)) : 0.5;
        let xOffset = (ratio - 0.5) * maxSpreadX * 2;
        let rot = (ratio - 0.5) * maxAngle;
        let yArch = -Math.sin(ratio * Math.PI) * 4; // Creates an arched card-hand curve

        let berrySpan = document.createElement('span');
        berrySpan.innerText = '🍓';
        berrySpan.className = 'absolute text-2xl select-none pointer-events-none filter drop-shadow transition-all duration-300';
        berrySpan.style.zIndex = i + 1; // Layered Z-Index
        berrySpan.style.transform = `translate(${xOffset.toFixed(1)}px, ${yArch.toFixed(1)}px) rotate(${rot.toFixed(1)}deg)`;
        
        container.appendChild(berrySpan);
    }
}

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
var modalQueue = [];
var isModalActive = false;

function showModal(title, text = '', vibratePattern = [50]) {
    // Add to queue so multiple notifications never overwrite each other
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
    document.getElementById('modal-desc').innerHTML = current.text ? current.text.replace(/\n/g, '<br>') : '';
    
    // If more alerts are waiting in line, show "Continue ➔"
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
        // If more notifications are waiting in the queue, smoothly display the next one!
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
    
    // Calculate and display Total Power
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

// --- INVENTORY BAG SYSTEM ---
function openInventory() {
    renderInventory();
    const modal = document.getElementById('inventory-modal');
    const content = document.getElementById('inventory-content');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        content.classList.remove('translate-y-full');
        content.classList.add('translate-y-0');
    }, 10);
    if (navigator.vibrate) navigator.vibrate(20);
}

function closeInventory() {
    const modal = document.getElementById('inventory-modal');
    const content = document.getElementById('inventory-content');
    modal.classList.add('opacity-0');
    content.classList.remove('translate-y-0');
    content.classList.add('translate-y-full');
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

    // Update active roster slot stats with live gameState
    syncCurrentPokemonToRoster();

    gameState.roster.forEach((p, index) => {
        let isActive = (p.id === gameState.id && p.name === gameState.name);
        list.innerHTML += `
            <div onclick="switchActivePokemon(${index})" class="flex items-center justify-between p-3 rounded-xl border ${isActive ? 'bg-indigo-900/60 border-indigo-400 shadow-md' : 'bg-gray-800/80 border-gray-700 hover:bg-gray-700/60'} cursor-pointer active:scale-95 transition-all">
                <div class="flex items-center gap-3">
                    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${p.id}.gif" class="w-12 h-12 object-contain pixel-perfect drop-shadow">
                    <div>
                        <div class="flex items-center gap-2">
                            <h4 class="font-bold text-sm text-white">${p.name}</h4>
                            ${isActive ? '<span class="text-[9px] bg-green-500 text-black font-black px-1.5 py-0.2 rounded">ACTIVE</span>' : ''}
                        </div>
                        <p class="text-xs text-gray-400">Lv. ${p.level} • HP: ${p.maxHp} • Atk: ${p.attack}</p>
                    </div>
                </div>
                <span class="text-xs font-bold ${isActive ? 'text-green-400' : 'text-indigo-400'}">
                    ${isActive ? '✓ Ready' : 'Swap 🔁'}
                </span>
            </div>
        `;
    });
}

function syncCurrentPokemonToRoster() {
    let found = false;
    for (let i = 0; i < gameState.roster.length; i++) {
        if (gameState.roster[i].id === gameState.id) {
            gameState.roster[i] = {
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
                xp: gameState.xp,
                maxXp: gameState.maxXp
            };
            found = true;
            break;
        }
    }
    if (!found) {
        gameState.roster.push({
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
            xp: gameState.xp,
            maxXp: gameState.maxXp
        });
    }
}

function switchActivePokemon(index) {
    if (index < 0 || index >= gameState.roster.length) return;
    syncCurrentPokemonToRoster();

    let target = gameState.roster[index];
    gameState.id = target.id;
    gameState.name = target.name;
    gameState.type = target.type || 'normal'; // <-- Switches Element!
    gameState.level = target.level;
    gameState.maxHp = target.maxHp;
    gameState.attack = target.attack;
    gameState.defense = target.defense;
    gameState.spAtk = target.spAtk;
    gameState.spDef = target.spDef;
    gameState.speed = target.speed;
    gameState.xp = target.xp;
    gameState.maxXp = target.maxXp;

    updateHub();
    renderPartyList();
    closeParty();
    showModal("Partner Swapped! 🔄", `You are now adventuring with ${gameState.name} (${(TYPE_DATABASE[gameState.type] || TYPE_DATABASE.normal).name} Type)!`);
}

function renderInventory() {
    const list = document.getElementById('inventory-list');
    list.innerHTML = ''; 
    
    if (gameState.berries > 0) {
        list.innerHTML += `
            <div class="flex justify-between items-center bg-gray-800 p-3 rounded-xl border border-gray-700 shadow-md">
                <div class="flex items-center gap-3">
                    <span class="text-4xl drop-shadow-md">🍓</span>
                    <div>
                        <h4 class="font-bold text-lg text-pink-300">Oran Berry</h4>
                        <p class="text-[10px] text-gray-400">Restores mood & grants XP.</p>
                    </div>
                </div>
                <div class="flex flex-col items-end">
                    <span class="font-black text-xl text-yellow-400">x${gameState.berries}</span>
                    <button onclick="feedBerry(); renderInventory();" class="mt-1 bg-pink-600 px-4 py-1 rounded-lg text-xs font-bold active:scale-90 transition-transform shadow-lg">Use</button>
                </div>
            </div>
        `;
    } else {
        list.innerHTML = `
            <div class="text-center text-gray-500 mt-10 p-6 bg-gray-800/50 rounded-xl border border-dashed border-gray-700">
                <span class="text-4xl opacity-50 block mb-2">🕸️</span>
                Your bag is empty.<br>Win battles to find items!
            </div>
        `;
    }
}

// --- PETTING SWIRL MECHANIC ---
let touchTimer;
let isSwirling = false;
const spriteContainer = document.getElementById('sprite-container');
const hubSprite = document.getElementById('hub-sprite');

// Prevent image dragging which breaks touch on mobile
hubSprite.ondragstart = () => false;
spriteContainer.style.touchAction = 'none'; // Prevents page scrolling while swirling

function startSwirl(e) {
    if (e.target.closest('#berry-bush')) return; // Ignore if tapping the Berry Bush!
    e.preventDefault();
    isSwirling = true;
    touchTimer = setTimeout(() => {
        if(isSwirling) gainHeart();
    }, 2000);
}

function stopSwirl() {
    isSwirling = false;
    clearTimeout(touchTimer);
}

spriteContainer.addEventListener('touchstart', startSwirl, {passive: false});
spriteContainer.addEventListener('mousedown', startSwirl);
window.addEventListener('touchend', stopSwirl);
window.addEventListener('mouseup', stopSwirl);
window.addEventListener('touchcancel', stopSwirl);

function gainHeart() {
    if(gameState.hearts < 10) {
        gameState.hearts++;
        const effect = document.getElementById('swirl-effect');
        const sprite = document.getElementById('hub-sprite');
        effect.classList.add('animate-swirl');
        sprite.classList.add('flash-white');
        
        // Give 0.5% XP for gaining a heart! (Minimum of 1 XP)
        let heartXp = Math.max(1, Math.floor(gameState.maxXp * 0.005));
        gameState.xp += heartXp;
        
        setTimeout(() => {
            effect.classList.remove('animate-swirl');
            sprite.classList.remove('flash-white');
            
            // Check if this tiny XP boost pushed us to a level up!
            if (gameState.xp >= gameState.maxXp) {
                document.getElementById('xp-bar').style.width = '100%';
                setTimeout(() => {
                    let leftoverXp = gameState.xp - gameState.maxXp;
                    levelUp(leftoverXp);
                }, 600);
            } else {
                updateHub();
            }
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
            gameState.xp += bonusXp;
            
            showModal("Yum! Full Belly Treat! 🍓", `${gameState.name} is full, but loved the treat! Gained +${bonusXp} XP (5% boost)!`);
            if (navigator.vibrate) navigator.vibrate(30);

            // Trigger level-up animation if this treat overflows the XP bar!
            if (gameState.xp >= gameState.maxXp) {
                document.getElementById('xp-bar').style.width = '100%';
                setTimeout(() => {
                    let leftoverXp = gameState.xp - gameState.maxXp;
                    levelUp(leftoverXp);
                }, 600);
            } else {
                updateHub();
            }
        }
    } else {
        showModal("Out of Berries!", "You don't have any berries left! Harvest your garden bush or win battles to find more.");
    }
}

// --- XP AND MOOD SYSTEM ---
function addXP(baseXp) {
    let multiplier = 0;
    if (gameState.hearts <= 1) multiplier = 0; 
    else if (gameState.hearts <= 3) multiplier = 0.5; 
    else if (gameState.hearts <= 5) multiplier = 2; 
    else multiplier = 3; 

    if (multiplier === 0) {
        showModal(`${gameState.name} is in a bad mood and refuses! Pet it or feed it.`);
        updateHub();
        return;
    }

    let gainedXp = Math.floor(baseXp * multiplier);
    let newTotalXp = gameState.xp + gainedXp;

    if (newTotalXp >= gameState.maxXp) {
        // Step 1: Animate the bar visually to 100%
        document.getElementById('xp-bar').style.width = '100%';
        
        // Step 2: Wait 600ms for the CSS transition to finish, THEN level up
        setTimeout(() => {
            let leftoverXp = newTotalXp - gameState.maxXp;
            levelUp(leftoverXp); // Pass the overflow XP into the next level
        }, 600);
    } else {
        // Normal XP gain without leveling up
        gameState.xp = newTotalXp;
        updateHub();
    }
}

function levelUp(leftoverXp = 0) {
    gameState.level++;
    gameState.xp = leftoverXp; // Keep the extra XP earned
    gameState.maxXp = Math.floor(gameState.maxXp * 1.5);
    
    // Stat gains based on mood (Guaranteed minimum of +1 per stat)
    let statBuff = gameState.hearts >= 5 ? 1.10 : (gameState.hearts >= 3 ? 1.05 : 1.0);
    gameState.maxHp = Math.max(gameState.maxHp + 1, Math.floor(gameState.maxHp * statBuff));
    gameState.attack = Math.max(gameState.attack + 1, Math.floor(gameState.attack * statBuff));
    gameState.defense = Math.max(gameState.defense + 1, Math.floor(gameState.defense * statBuff));
    gameState.spAtk = Math.max(gameState.spAtk + 1, Math.floor(gameState.spAtk * statBuff));
    gameState.spDef = Math.max(gameState.spDef + 1, Math.floor(gameState.spDef * statBuff));
    gameState.speed = Math.max(gameState.speed + 1, Math.floor(gameState.speed * statBuff));

    // Instantly snap XP bar back to 0 without animation
    let xpBar = document.getElementById('xp-bar');
    xpBar.style.transition = 'none';
    xpBar.style.width = '0%';

    // Wait 50ms, then turn animations back on and apply the new stats/leftover XP
    setTimeout(() => {
        xpBar.style.transition = 'all 0.5s ease';
        updateHub(); // This animates the bar to the leftover XP amount
        
        if (gameState.level === 7) {
            showModal("NEW MOVE UNLOCKED! 🌿", `${gameState.name} learned Vine Whip! A powerful attack driven by your Sp. Atk!`);
        } else if (gameState.level === 13) {
            showModal("NEW MOVE UNLOCKED! 🌱", `${gameState.name} learned Leech Seed! Drains enemy health to heal your HP!`);
        } else if (gameState.level === 18) {
            showModal("NEW MOVE UNLOCKED! 🍃", `${gameState.name} learned Razor Leaf! Slices foes with high Critical Hit power!`);
        } else if (gameState.level > 10 && Math.random() > 0.5 && gameState.id === 1) {
            triggerEvolution(2, 'Ivysaur');
        } else {
            showModal(`${gameState.name} grew to Level ${gameState.level}!`);
        }
    }, 50);
}

//// --- BATTLE SYSTEM ---
var eHp = 100;
var eMaxHp = 100;
var pHp = gameState.maxHp;
var enemyLevel = 1;
var enemyAttack = 10;
var enemyDefense = 0;
var isBoss = false;
var enemyBaseName = "Wild Pokemon";
var enemyType = "normal"; // <-- Elemental Type Tracking

// --- ELEMENTAL TYPE BADGE RENDERER ---
function updateTypeBadge(elementId, typeKey) {
    const badge = document.getElementById(elementId);
    if (!badge) return;
    const typeInfo = TYPE_DATABASE[typeKey] || TYPE_DATABASE.normal;
    badge.innerText = `${typeInfo.name} ${typeInfo.icon}`;
    badge.className = `text-[9px] px-2 py-0.5 rounded-full font-black uppercase shadow-md ${typeInfo.bg}`;
}

// --- OFFICIAL 18-TYPE EFFECTIVENESS CALCULATOR ---
function getTypeMultiplier(moveTypeKey, defenderTypeKey) {
    const moveInfo = TYPE_DATABASE[moveTypeKey] || TYPE_DATABASE.normal;
    const defenderInfo = TYPE_DATABASE[defenderTypeKey] || TYPE_DATABASE.normal;

    if (moveInfo.superVs.includes(defenderTypeKey)) return 2.0; // 2x Super Effective!
    if (defenderInfo.weakVs && !defenderInfo.weakVs.includes(moveTypeKey) && moveTypeKey !== 'normal') {
        if (moveTypeKey === defenderTypeKey) return 0.5; // Same type resistance
    }
    if (moveTypeKey === 'normal') return 1.0;
    return 1.0;
}

// --- DYNAMIC MOVESET DISPATCHER ---
function updateBattleMoveButtons() {
    const pType = gameState.type || 'grass';
    const typeData = TYPE_DATABASE[pType] || TYPE_DATABASE.grass;

    // Slot 0 (Physical Basic)
    const btn0 = document.getElementById('btn-move-0');
    if (btn0) {
        document.getElementById('move-name-0').innerText = typeData.moves[0].name;
        document.getElementById('move-type-0').innerText = typeData.moves[0].desc;
        btn0.disabled = false;
    }

    // Slot 1 (Status Debuff)
    const btn1 = document.getElementById('btn-move-1');
    if (btn1) {
        document.getElementById('move-name-1').innerText = typeData.moves[1].name;
        document.getElementById('move-type-1').innerText = typeData.moves[1].desc;
        btn1.disabled = false;
    }

    // Slot 2 (Lv. 7 Elemental Special)
    const btn2 = document.getElementById('btn-move-2');
    if (btn2) {
        if (gameState.level >= 7) {
            btn2.disabled = false;
            document.getElementById('move-name-2').innerText = typeData.moves[2].name;
            document.getElementById('move-type-2').innerText = typeData.moves[2].desc;
        } else {
            btn2.disabled = true;
            document.getElementById('move-name-2').innerText = `🔒 ${typeData.moves[2].name}`;
            document.getElementById('move-type-2').innerText = "Unlocks Lv. 7";
        }
    }

    // Slot 3 (Lv. 13 Elemental Ultimate)
    const btn3 = document.getElementById('btn-move-3');
    if (btn3) {
        if (gameState.level >= 13) {
            btn3.disabled = false;
            document.getElementById('move-name-3').innerText = typeData.moves[3].name;
            document.getElementById('move-type-3').innerText = typeData.moves[3].desc;
        } else {
            btn3.disabled = true;
            document.getElementById('move-name-3').innerText = `🔒 ${typeData.moves[3].name}`;
            document.getElementById('move-type-3').innerText = "Unlocks Lv. 13";
        }
    }
}

function setAttackButtonsDisabled(disabled) {
    if (disabled) {
        const btns = document.querySelectorAll('#move-grid button');
        btns.forEach(btn => { btn.disabled = true; });
    } else {
        updateBattleMoveButtons();
    }
}

function setBattleLog(msg) {
    const logEl = document.getElementById('battle-log');
    if (logEl) logEl.innerText = msg;
}

// --- STAGE NAVIGATOR FUNCTION ---
function changeStage(delta) {
    let targetStage = gameState.currentStage + delta;
    if (targetStage >= 1 && targetStage <= gameState.maxStage) {
        gameState.currentStage = targetStage;
        updateHub();
        enterBattle(); // Re-rolls an enemy matching the chosen stage!
    }
}

function updateStageNavigatorUI() {
    const stageText = document.getElementById('stage-indicator');
    const stageMax = document.getElementById('stage-max-indicator');
    const btnPrev = document.getElementById('btn-prev-stage');
    const btnNext = document.getElementById('btn-next-stage');

    if (stageText && stageMax) {
        let isBossStage = (gameState.currentStage % 5 === 0);
        stageText.innerText = isBossStage ? `👑 BOSS STAGE ${gameState.currentStage}` : `STAGE ${gameState.currentStage}`;
        stageText.className = isBossStage ? "text-xs font-black text-pink-400 animate-pulse tracking-wider" : "text-xs font-black text-yellow-400 tracking-wider";
        stageMax.innerText = `(Max: ${gameState.maxStage})`;
        
        // Disable buttons at boundaries
        if (btnPrev) btnPrev.disabled = (gameState.currentStage <= 1);
        if (btnNext) btnNext.disabled = (gameState.currentStage >= gameState.maxStage);
    }
}

function enterBattle() {
    if(gameState.hearts <= 1) {
        showModal(`${gameState.name} is too sad to battle!`); return;
    }
    if(gameState.hearts <= 3 && Math.random() > 0.5) {
        showModal(`${gameState.name} refused to battle!`); return;
    }

    showScreen('battle-screen');
    enemyLevel = gameState.currentStage; // Uses the selected stage!
    updateStageNavigatorUI();

    // --- BOSS CHECK (Every 5 Levels) ---
    isBoss = (enemyLevel % 5 === 0);

    // --- COMPOUND EXPONENTIAL ENEMY SCALING ---
    let levelDiff = Math.max(0, enemyLevel - 3);
    eMaxHp = Math.floor(60 * Math.pow(1.085, levelDiff));
    enemyAttack = Math.floor(6 * Math.pow(1.07, levelDiff));
    enemyDefense = Math.floor(4 * Math.pow(1.06, levelDiff));

    if (isBoss) {
        eMaxHp = Math.floor(eMaxHp * 2.5);
        enemyAttack = Math.floor(enemyAttack * 1.3);
        enemyDefense = Math.floor(enemyDefense * 1.5);
    }

    eHp = eMaxHp;
    pHp = gameState.maxHp;
    setAttackButtonsDisabled(false);

    // Update Player Type & Enemy Type Badges
    updateTypeBadge('player-type-badge', gameState.type || 'grass');

    const allTypes = Object.keys(TYPE_DATABASE);
    enemyType = allTypes[Math.floor(Math.random() * allTypes.length)];
    updateTypeBadge('enemy-type-badge', enemyType);

    // Load Wild Pokemon
    let wildId = Math.floor(Math.random() * 150) + 1;
    document.getElementById('enemy-sprite').src = `assets/sprites/${wildId}_animated.gif`;
    document.getElementById('enemy-sprite').onerror = function() {
        this.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${wildId}.gif`;
    };

    enemyBaseName = isBoss ? "👑 BOSS" : "Wild Pokemon";
    document.getElementById('enemy-name').innerText = `${enemyBaseName} (Lv. ${enemyLevel})`;
    
    currentWildData = { id: wildId, name: "Wild Pokemon", level: enemyLevel };

    fetch(`https://pokeapi.co/api/v2/pokemon/${wildId}`)
        .then(res => res.json())
        .then(data => {
            let capitalized = data.name.charAt(0).toUpperCase() + data.name.slice(1);
            enemyBaseName = isBoss ? `👑 BOSS ${capitalized}` : `Wild ${capitalized}`;
            currentWildData.name = capitalized;
            document.getElementById('enemy-name').innerText = `${enemyBaseName} (Lv. ${enemyLevel})`;
            
            if (data.types && data.types[0]) {
                enemyType = data.types[0].type.name.toLowerCase();
                if (!TYPE_DATABASE[enemyType]) enemyType = 'normal';
                updateTypeBadge('enemy-type-badge', enemyType);
            }
        })
        .catch(err => console.log(err));

    document.getElementById('battle-player-sprite').src = document.getElementById('hub-sprite').src;
    document.getElementById('battle-player-name').innerText = `${gameState.name} (Lv. ${gameState.level})`;

    // Update Pokeball badge in battle
    const pbBadge = document.getElementById('pokeball-count-badge');
    if (pbBadge) pbBadge.innerText = gameState.pokeballs || 0;

    setBattleLog(isBoss ? `⚠️ WARNING: A POWERFUL BOSS APPEARED!` : `A wild foe appeared!`);
    updateHealthBars();
}

// --- CATCH MECHANIC ---
var currentWildData = { id: 1, name: "Wild Pokemon", level: 1 };

function throwPokeBall() {
    if (!gameState.pokeballs || gameState.pokeballs <= 0) {
        showModal("Out of Pokéballs!", "You don't have any Pokéballs left! Win boss battles to find more.");
        return;
    }

    setAttackButtonsDisabled(true);
    gameState.pokeballs--;
    const pbBadge = document.getElementById('pokeball-count-badge');
    if (pbBadge) pbBadge.innerText = gameState.pokeballs;

    setBattleLog(`You threw a Pokéball at ${enemyBaseName}!`);
    if (navigator.vibrate) navigator.vibrate([30, 100, 30]);

    setTimeout(() => {
        // Higher catch rate when enemy HP is low! (Up to 85% chance)
        let hpMissingPercent = (eMaxHp - eHp) / eMaxHp;
        let catchChance = 0.25 + (hpMissingPercent * 0.60);
        if (isBoss) catchChance *= 0.6; // Bosses are harder to catch

        if (Math.random() < catchChance) {
            // SUCCESSFUL CATCH!
            setBattleLog(`Gotcha! ${enemyBaseName} was caught! 🎉`);
            
            // Generate clean stats for caught Pokemon based on its stage level
            let caughtPokemon = {
                id: currentWildData.id,
                name: currentWildData.name.replace('Wild ', '').replace('👑 BOSS ', ''),
                type: enemyType || 'normal',
                level: enemyLevel,
                maxHp: Math.floor(60 + (enemyLevel * 6)),
                attack: Math.floor(8 + (enemyLevel * 1.5)),
                defense: Math.floor(8 + (enemyLevel * 1.5)),
                spAtk: Math.floor(10 + (enemyLevel * 1.8)),
                spDef: Math.floor(10 + (enemyLevel * 1.8)),
                speed: Math.floor(7 + (enemyLevel * 1.2)),
                xp: 0,
                maxXp: Math.floor(100 * Math.pow(1.3, enemyLevel - 5))
            };

            if (!gameState.roster) gameState.roster = [];
            gameState.roster.push(caughtPokemon);

            setTimeout(() => {
                showModal("🎉 POKÉMON CAUGHT!", `You successfully caught a Lv. ${enemyLevel} ${caughtPokemon.name}! It has been added to your Party roster.`);
                endBattle(true);
            }, 1000);
        } else {
            // FAILED CATCH
            setBattleLog(`Oh no! ${enemyBaseName} broke free!`);
            setTimeout(enemyTurn, 1000);
        }
    }, 1200);
}

// --- FLOATING COMBAT TEXT & HIT REACTION ENGINE ---
function spawnFloatingText(targetWrapperId, text, type = 'damage') {
    const container = document.getElementById(targetWrapperId);
    if (!container) return;

    const el = document.createElement('div');
    let colorClass = (type === 'heal') ? 'floating-heal' : ((type === 'crit' || type === 'super') ? 'floating-crit text-base' : 'floating-damage text-lg');
    el.className = `floating-combat-text ${colorClass}`;
    el.innerText = text;
    
    // Slight random offset so multi-hits don't stack directly on top of each other
    let randX = Math.floor(Math.random() * 24) - 12;
    el.style.left = `calc(50% + ${randX}px)`;
    el.style.top = '10%';

    container.appendChild(el);
    setTimeout(() => { if (el.parentNode) el.remove(); }, 950);
}

function triggerHitReaction(spriteId) {
    const sprite = document.getElementById(spriteId);
    if (!sprite) return;
    sprite.classList.remove('hit-flash-effect');
    void sprite.offsetWidth; // Trigger DOM reflow to restart animation
    sprite.classList.add('hit-flash-effect');
    setTimeout(() => sprite.classList.remove('hit-flash-effect'), 450);
}

function playerAttack(slot = 0) {
    setAttackButtonsDisabled(true);

    const pType = gameState.type || 'grass';
    const typeData = TYPE_DATABASE[pType] || TYPE_DATABASE.normal;
    
    // Support string fallbacks for unit tests
    let moveIndex = (typeof slot === 'number') ? slot : (slot === 'growl' ? 1 : (slot === 'vinewhip' ? 2 : (slot === 'leechseed' || slot === 'razorleaf' ? 3 : 0)));
    const move = typeData.moves[moveIndex];

    let multiplier = (move.type === 'physical' || move.type === 'status') ? 1.0 : getTypeMultiplier(pType, enemyType);
    let typeEffectText = "";
    
    if (multiplier === 2.0) {
        typeEffectText = " 🔥 SUPER EFFECTIVE (2x)!";
        const fx = document.getElementById('elemental-fx');
        if (fx) {
            fx.classList.remove('hidden');
            setTimeout(() => fx.classList.add('hidden'), 450);
        }
        if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
    } else if (multiplier === 0.5) {
        typeEffectText = " 💧 Not very effective (0.5x)...";
    }

    if (move.type === 'status') {
        // --- SLOT 1: STATUS DEBUFF ---
        enemyAttack = Math.max(1, enemyAttack - 2);
        enemyDefense = Math.max(0, enemyDefense - 4);
        setBattleLog(`${gameState.name} used ${move.name}! Enemy stats were shredded!`);

    } else if (move.type === 'special') {
        // --- SLOT 2: ELEMENTAL SPECIAL (Lv. 7, Scales with Sp. Atk) ---
        let defenseMitigation = Math.floor(enemyDefense / 5);
        let baseDmg = Math.max(1, Math.floor(gameState.spAtk * move.power) - defenseMitigation);
        let damage = Math.max(1, Math.floor(baseDmg * multiplier));
        eHp -= damage;
        setBattleLog(`${move.name} hit for ${damage} Special Damage!${typeEffectText}`);

    } else if (move.type === 'ultimate') {
        // --- SLOT 3: ULTIMATE MOVE (Lv. 13, Dmg + Effects) ---
        let defenseMitigation = Math.floor(enemyDefense / 6);
        let baseDmg = Math.max(1, Math.floor((gameState.attack + gameState.spAtk) * move.power * 0.7) - defenseMitigation);
        let damage = Math.max(1, Math.floor(baseDmg * multiplier));
        
        // Grass/Poison drains HP, Fire/Electric crits
        if (pType === 'grass' || pType === 'poison') {
            let heal = Math.max(1, Math.floor(damage * 0.5));
            pHp = Math.min(gameState.maxHp, pHp + heal);
            setBattleLog(`${move.name} dealt ${damage} dmg and drained ${heal} HP!${typeEffectText}`);
        } else {
            eHp -= damage;
            setBattleLog(`${move.name} blasted the foe for ${damage} Massive Damage!${typeEffectText}`);
        }
        eHp -= damage;

    } else {
        // --- SLOT 0: BASIC PHYSICAL ATTACK ---
        let defenseMitigation = Math.floor(enemyDefense / 4);
        let damage = Math.max(1, gameState.attack - defenseMitigation);
        eHp -= damage;
        setBattleLog(`${gameState.name} used ${move.name} for ${damage} damage!`);
    }

    // --- TRIGGER FLOATING COMBAT TEXT & STROBE HIT REACTION ---
    if (move.type !== 'status') {
        triggerHitReaction('enemy-sprite');
        spawnFloatingText('enemy-sprite-wrapper', `-${damage}`, (multiplier === 2.0) ? 'super' : 'damage');

        if (multiplier === 2.0) {
            setTimeout(() => spawnFloatingText('enemy-sprite-wrapper', '🔥 SUPER EFFECTIVE!', 'super'), 120);
        } else if (multiplier === 0.5) {
            setTimeout(() => spawnFloatingText('enemy-sprite-wrapper', '💧 RESISTED (0.5x)', 'damage'), 120);
        }

        // Floating heal numbers for Leech Seed
        if (move.type === 'ultimate' && (pType === 'grass' || pType === 'poison')) {
            let healAmt = Math.max(1, Math.floor(damage * 0.5));
            spawnFloatingText('player-sprite-wrapper', `+${healAmt} HP`, 'heal');
        }
    } else {
        // Status debuff floating text
        spawnFloatingText('enemy-sprite-wrapper', '🔻 STATS DROP', 'crit');
    }

    updateHealthBars();

    if (eHp <= 0) {
        setBattleLog(`${enemyBaseName} fainted!`);
        setTimeout(() => endBattle(true), 800);
        return;
    }

    setTimeout(enemyTurn, 1000);
}

function enemyTurn() {
    let baseDamage = Math.max(1, enemyAttack - Math.floor(gameState.defense / 4));
    let damage = baseDamage;
    let enemyEffectText = "";

    // Enemy Type Counter-Buffs on Bulbasaur (Grass Type)
    if (enemyType === 'fire') {
        damage = Math.floor(baseDamage * 1.35); // Fire burns grass!
        enemyEffectText = " 🔥 Super effective on you!";
    } else if (enemyType === 'water') {
        damage = Math.max(1, Math.floor(baseDamage * 0.75)); // Grass resists water!
        enemyEffectText = " 🛡️ You resisted the hit!";
    }

    pHp -= damage;
    setBattleLog(`${enemyBaseName} attacked for ${damage} damage!${enemyEffectText}`);
    
    // --- PLAYER HIT REACTION & FLOATING TEXT ---
    triggerHitReaction('battle-player-sprite');
    spawnFloatingText('player-sprite-wrapper', `-${damage}`, (enemyType === 'fire') ? 'super' : 'damage');
    if (enemyType === 'fire') {
        setTimeout(() => spawnFloatingText('player-sprite-wrapper', '🔥 SUPER EFFECTIVE!', 'super'), 120);
    } else if (enemyType === 'water') {
        setTimeout(() => spawnFloatingText('player-sprite-wrapper', '🛡️ RESISTED!', 'heal'), 120);
    }

    updateHealthBars();

    if (pHp <= 0) {
        setBattleLog(`${gameState.name} fainted!`);
        setTimeout(() => endBattle(false), 800);
    } else {
        setAttackButtonsDisabled(false);
    }
}

function updateHealthBars() {
    document.getElementById('player-hp').style.width = `${Math.max(0, (pHp/gameState.maxHp)*100)}%`;
    document.getElementById('enemy-hp').style.width = `${Math.max(0, (eHp/eMaxHp)*100)}%`;
}

function endBattle(won) {
    if(won) {
        let beatenStage = gameState.currentStage;
        let isNewRecord = (gameState.currentStage === gameState.maxStage);

        // Advance stage if player beat their highest unlocked stage
        if (isNewRecord) {
            gameState.maxStage++;
            gameState.currentStage++; 
        }

        // 1. Calculate XP with Mood Multiplier
        let multiplier = (gameState.hearts <= 1) ? 0 : (gameState.hearts <= 3 ? 0.5 : (gameState.hearts <= 5 ? 2 : 3));
        let earnedXp = Math.floor(50 * multiplier);

        // 2. Calculate Loot Drops
        let lootText = "<span class='text-gray-400'>None</span>";
        if (isBoss) {
            let bossBerries = Math.floor(Math.random() * 3) + 3; // 3 to 5 berries
            gameState.berries += bossBerries;
            lootText = `<span class='text-pink-400 font-bold'>+${bossBerries} 🍓 Berries (Boss Drop!)</span>`;
        } else if (Math.random() < 0.45) {
            let foundBerries = Math.floor(Math.random() * 2) + 1;
            gameState.berries += foundBerries;
            lootText = `<span class='text-pink-400 font-bold'>+${foundBerries} 🍓 Berry</span>`;
        }

        // 3. Assemble Victory Card Details
        let title = isBoss ? `👑 BOSS CLEARED!` : `🏆 VICTORY!`;
        let progressMsg = isNewRecord 
            ? `<span class='text-yellow-400 font-black'>🌟 Stage ${gameState.maxStage} Unlocked!</span>` 
            : `<span class='text-gray-400'>🔄 Stage ${beatenStage} Cleared</span>`;

        let victoryCard = `
            <div class='bg-gray-900/80 p-4 rounded-xl border border-gray-700 text-left text-sm space-y-2 mt-2 shadow-inner'>
                <div>⚡ <strong class='text-white'>XP Gained:</strong> <span class='text-green-400 font-bold'>+${earnedXp} XP</span> <span class='text-[10px] text-gray-400'>(${multiplier}x Mood)</span></div>
                <div>🎁 <strong class='text-white'>Loot:</strong> ${lootText}</div>
                <div class='pt-2 border-t border-gray-800'>${progressMsg}</div>
            </div>
        `.trim();

        updateHub();
        showModal(title, victoryCard, [40, 60, 40]);
        
        // Switch to hub FIRST, then trigger XP animation
        showScreen('hub-screen');
        setTimeout(() => addXP(50), 300);
    } else {
        showModal("You blacked out...");
        gameState.hearts = Math.max(0, gameState.hearts - 2); 
        updateHub();
        showScreen('hub-screen');
    }
}

// --- EVOLUTION SYSTEM ---
function triggerEvolution(newId, newName) {
    showScreen('evo-screen');
    document.getElementById('evo-old-name').innerText = gameState.name;
    document.getElementById('evo-sprite').src = document.getElementById('hub-sprite').src;
    
    setTimeout(() => {
        gameState.id = newId;
        gameState.name = newName;
        gameState.maxHp += 30;
        gameState.attack += 20;
        gameState.defense += 20;
        gameState.spAtk += 20;
        gameState.spDef += 20;
        gameState.speed += 15;
        
        document.getElementById('evo-sprite').classList.remove('brightness-0', 'animate-pulse');
        document.getElementById('evo-sprite').src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${newId}.gif`;
        
        setTimeout(() => {
            showModal(`Your Pokemon evolved into ${newName}!`);
            updateHub();
            showScreen('hub-screen');
        }, 2000);
    }, 3000);
}