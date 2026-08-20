// ============================================================================
// GLOBAL CONSTANTS & SHARED STATE (global.js)
// ============================================================================

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

// --- XL STAT SLICER ITEMS DATABASE ---
const XL_ITEM_CONFIG = {
    hpXL: { name: "HP-XL", icon: "💚", desc: "Permanently boosts Max HP by +2%", color: "text-green-400", stat: "maxHp" },
    atkXL: { name: "Attack-XL", icon: "❤️", desc: "Permanently boosts Attack by +2%", color: "text-red-400", stat: "attack" },
    defXL: { name: "Defense-XL", icon: "💙", desc: "Permanently boosts Defense by +2%", color: "text-blue-400", stat: "defense" },
    spAtkXL: { name: "Sp.Atk-XL", icon: "💜", desc: "Permanently boosts Sp. Atk by +2%", color: "text-purple-400", stat: "spAtk" },
    spDefXL: { name: "Sp.Def-XL", icon: "🔮", desc: "Permanently boosts Sp. Def by +2%", color: "text-indigo-400", stat: "spDef" },
    speedXL: { name: "Speed-XL", icon: "⚡", desc: "Permanently boosts Speed by +2%", color: "text-yellow-400", stat: "speed" },
    critXL: { name: "Crit-XL", icon: "💥", desc: "Permanently boosts Crit Rate by +0.25%", color: "text-amber-400", stat: "critRate" }
};

// --- POKÉDEX SPAWN POOLS ---
const BASE_POKEMON_IDS = [
    1, 4, 7, 10, 13, 16, 19, 21, 23, 25, 27, 29, 32, 35, 37, 39, 41, 43, 46, 48, 
    50, 52, 54, 56, 58, 60, 63, 66, 69, 72, 74, 77, 79, 81, 83, 84, 86, 88, 90, 
    92, 95, 96, 98, 100, 102, 104, 108, 109, 111, 113, 114, 115, 116, 118, 120, 
    122, 123, 124, 125, 126, 127, 128, 129, 131, 132, 133, 137, 138, 140, 142, 143, 147
];

const EVOLVED_BOSS_IDS = [
    2, 3, 5, 6, 8, 9, 11, 12, 14, 15, 17, 18, 20, 22, 24, 26, 28, 30, 31, 33, 34, 
    36, 38, 40, 42, 44, 45, 47, 49, 51, 53, 55, 57, 59, 61, 62, 64, 65, 67, 68, 
    70, 71, 73, 75, 76, 78, 80, 82, 85, 87, 89, 91, 93, 94, 97, 99, 101, 103, 
    105, 106, 107, 110, 112, 117, 119, 121, 130, 134, 135, 136, 139, 141, 148, 149
];

// --- CORE GAME STATE ---
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

// --- SCREEN LIST & STORY ---
const screens = ['loading-screen', 'main-menu', 'intro-screen', 'hub-screen', 'battle-screen', 'evo-screen'];
let storyStep = 0;
const storyLines = [
    "Welcome to the world of Pokemon! Your dream to become a Master begins now.",
    "I am the Professor. I'm gifting you this Bulbasaur to start your journey!",
    "Take good care of it. Feed it, pet it, and battle to grow stronger!"
];

// --- BATTLE ENCOUNTER STATE ---
var eHp = 100;
var eMaxHp = 100;
var pHp = 40;
var enemyLevel = 1;
var enemyAttack = 10;
var enemyDefense = 0;
var isBoss = false;
var enemyBaseName = "Wild Pokemon";
var enemyType = "normal";
var battleDamageDealt = 0;
var battleDamageReceived = 0;
var statusCooldown = 0;
var currentWildData = { id: 1, name: "Wild Pokemon", level: 1 };

// --- NOTIFICATION QUEUE STATE ---
var modalQueue = [];
var isModalActive = false;