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

// Game State (With XL Stat Slicers Inventory)
var gameState = {
    id: 1, name: 'Bulbasaur', type: 'grass', level: 1, xp: 0, maxXp: 50, 
    hearts: 2, attack: 5, defense: 5, maxHp: 40,
    spAtk: 6, spDef: 6, speed: 5, critRate: 5.0,
    berries: 5, pokeballs: 3,
    items: { hpXL: 0, atkXL: 0, defXL: 0, spAtkXL: 0, spDefXL: 0, speedXL: 0, critXL: 0 },
    lastInteraction: Date.now(),
    currentStage: 1, maxStage: 1,
    gardenBerries: 1, lastGardenHarvest: Date.now(),
    roster: [{
        id: 1, name: 'Bulbasaur', type: 'grass', level: 1, xp: 0, maxXp: 50,
        attack: 5, defense: 5, maxHp: 40, spAtk: 6, spDef: 6, speed: 5, critRate: 5.0
    }]
};

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
        
        if (gameState.berries === undefined) gameState.berries = 5;
        if (gameState.pokeballs === undefined) gameState.pokeballs = 3;
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
                xp: gameState.xp,
                maxXp: gameState.maxXp
            }];
        }

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
    
    const hubBarLvl = document.getElementById('hub-bar-level');
    if (hubBarLvl) hubBarLvl.innerText = gameState.level;

    document.getElementById('xp-bar').style.width = `${(gameState.xp / gameState.maxXp) * 100}%`;
    const xpText = document.getElementById('xp-text');
    if (xpText) {
        xpText.innerText = `${gameState.xp} / ${gameState.maxXp}`;
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
        hubPowerEl.innerText = totalPower;
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

    let maxSpreadX = 14;
    let maxAngle = 36;

    for (let i = 0; i < count; i++) {
        let ratio = count > 1 ? (i / (count - 1)) : 0.5;
        let xOffset = (ratio - 0.5) * maxSpreadX * 2;
        let rot = (ratio - 0.5) * maxAngle;
        let yArch = -Math.sin(ratio * Math.PI) * 4;

        let berrySpan = document.createElement('span');
        berrySpan.innerText = '🍓';
        berrySpan.className = 'absolute text-2xl select-none pointer-events-none filter drop-shadow transition-all duration-300';
        berrySpan.style.zIndex = i + 1;
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
    gameState.type = target.type || 'normal';
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

// --- PETTING SWIRL MECHANIC ---
let touchTimer;
let isSwirling = false;
const spriteContainer = document.getElementById('sprite-container');
const hubSprite = document.getElementById('hub-sprite');

hubSprite.ondragstart = () => false;
spriteContainer.style.touchAction = 'none';

function startSwirl(e) {
    if (e.target.closest('#berry-bush')) return;
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
        
        let heartXp = Math.max(1, Math.floor(gameState.maxXp * 0.005));
        gameState.xp += heartXp;
        
        setTimeout(() => {
            effect.classList.remove('animate-swirl');
            sprite.classList.remove('flash-white');
            
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
            gameState.berries--;
            let bonusXp = Math.max(5, Math.floor(gameState.maxXp * 0.05));
            gameState.xp += bonusXp;
            
            showModal("Yum! Full Belly Treat! 🍓", `${gameState.name} is full, but loved the treat! Gained +${bonusXp} XP (5% boost)!`);
            if (navigator.vibrate) navigator.vibrate(30);

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
        document.getElementById('xp-bar').style.width = '100%';
        setTimeout(() => {
            let leftoverXp = newTotalXp - gameState.maxXp;
            levelUp(leftoverXp);
        }, 600);
    } else {
        gameState.xp = newTotalXp;
        updateHub();
    }
}

function levelUp(leftoverXp = 0) {
    gameState.level++;
    gameState.xp = leftoverXp;
    gameState.maxXp = Math.floor(gameState.maxXp * 1.5);
    
    let statBuff = gameState.hearts >= 5 ? 1.10 : (gameState.hearts >= 3 ? 1.05 : 1.0);
    gameState.maxHp = Math.max(gameState.maxHp + 1, Math.floor(gameState.maxHp * statBuff));
    gameState.attack = Math.max(gameState.attack + 1, Math.floor(gameState.attack * statBuff));
    gameState.defense = Math.max(gameState.defense + 1, Math.floor(gameState.defense * statBuff));
    gameState.spAtk = Math.max(gameState.spAtk + 1, Math.floor(gameState.spAtk * statBuff));
    gameState.spDef = Math.max(gameState.spDef + 1, Math.floor(gameState.spDef * statBuff));
    gameState.speed = Math.max(gameState.speed + 1, Math.floor(gameState.speed * statBuff));
    gameState.critRate = parseFloat(((gameState.critRate || 5.0) + 0.05).toFixed(2));

    let xpBar = document.getElementById('xp-bar');
    xpBar.style.transition = 'none';
    xpBar.style.width = '0%';

    setTimeout(() => {
        xpBar.style.transition = 'all 0.5s ease';
        updateHub();
        
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