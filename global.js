// ============================================================================
// GLOBAL CONSTANTS & SHARED STATE (global.js)
// ============================================================================

// --- COMPACT NUMBER FORMATTER (999, 1.00K, 999.99K, 1.00M, 1.00B) ---
function formatNumber(num) {
    if (num === null || num === undefined || isNaN(num)) return '0';
    if (num < 1000) return Math.floor(num).toString();

    const tiers = [
        { value: 1e12, symbol: 'T' },
        { value: 1e9, symbol: 'B' },
        { value: 1e6, symbol: 'M' },
        { value: 1e3, symbol: 'K' }
    ];

    for (let i = 0; i < tiers.length; i++) {
        if (num >= tiers[i].value) {
            let formatted = (num / tiers[i].value).toFixed(2);
            return `${formatted}${tiers[i].symbol}`;
        }
    }
    return num.toString();
}

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

// --- BALANCED AFK TRAINING EXPEDITION TIERS ---
const EXPEDITION_TIERS = [
    { id: 'scout', name: 'Quick Scout', icon: '🌲', durationLabel: '2 Min', growthLabel: '+5% XP', timeMs: 2 * 60 * 1000, xpPct: 0.05 },
    { id: 'drill', name: 'Field Drill', icon: '🥋', durationLabel: '10 Min', growthLabel: '+20% XP', timeMs: 10 * 60 * 1000, xpPct: 0.20 },
    { id: 'trek', name: 'Mountain Trek', icon: '⛰️', durationLabel: '1 Hour', growthLabel: '+65% XP', timeMs: 60 * 60 * 1000, xpPct: 0.65 },
    { id: 'ruins', name: 'Ancient Ruins', icon: '🏛️', durationLabel: '6 Hours', growthLabel: '+160% XP', timeMs: 6 * 60 * 60 * 1000, xpPct: 1.60 },
    { id: 'sanctuary', name: 'Deep Sanctuary', icon: '🌌', durationLabel: '24 Hours', growthLabel: '+400% XP', timeMs: 24 * 60 * 60 * 1000, xpPct: 4.00 }
];

// --- COMPLETE GEN 1 EVOLUTION DATABASE (2-STAGE & 3-STAGE) ---
const EVOLUTION_DATABASE = {
    // Starters (3-Stage Lines)
    1: { toId: 2, toName: 'Ivysaur', level: 16, type: 'grass' },
    2: { toId: 3, toName: 'Venusaur', level: 32, type: 'grass' },
    4: { toId: 5, toName: 'Charmeleon', level: 16, type: 'fire' },
    5: { toId: 6, toName: 'Charizard', level: 36, type: 'fire' },
    7: { toId: 8, toName: 'Wartortle', level: 16, type: 'water' },
    8: { toId: 9, toName: 'Blastoise', level: 36, type: 'water' },

    // Bugs & Birds
    10: { toId: 11, toName: 'Metapod', level: 7, type: 'bug' },
    11: { toId: 12, toName: 'Butterfree', level: 10, type: 'bug' },
    13: { toId: 14, toName: 'Kakuna', level: 7, type: 'bug' },
    14: { toId: 15, toName: 'Beedrill', level: 10, type: 'bug' },
    16: { toId: 17, toName: 'Pidgeotto', level: 18, type: 'flying' },
    17: { toId: 18, toName: 'Pidgeot', level: 36, type: 'flying' },
    19: { toId: 20, toName: 'Raticate', level: 20, type: 'normal' },
    21: { toId: 22, toName: 'Fearow', level: 20, type: 'flying' },
    23: { toId: 24, toName: 'Arbok', level: 22, type: 'poison' },
    25: { toId: 26, toName: 'Raichu', level: 26, type: 'electric' },
    27: { toId: 28, toName: 'Sandslash', level: 22, type: 'ground' },

    // Nidos (3-Stage Lines)
    29: { toId: 30, toName: 'Nidorina', level: 16, type: 'poison' },
    30: { toId: 31, toName: 'Nidoqueen', level: 36, type: 'poison' },
    32: { toId: 33, toName: 'Nidorino', level: 16, type: 'poison' },
    33: { toId: 34, toName: 'Nidoking', level: 36, type: 'poison' },

    // Classics & 3-Stage Powerhouses
    35: { toId: 36, toName: 'Clefable', level: 26, type: 'fairy' },
    37: { toId: 38, toName: 'Ninetales', level: 28, type: 'fire' },
    39: { toId: 40, toName: 'Wigglytuff', level: 26, type: 'normal' },
    41: { toId: 42, toName: 'Golbat', level: 22, type: 'poison' },
    43: { toId: 44, toName: 'Gloom', level: 21, type: 'grass' },
    44: { toId: 45, toName: 'Vileplume', level: 36, type: 'grass' },
    46: { toId: 47, toName: 'Parasect', level: 24, type: 'bug' },
    48: { toId: 49, toName: 'Venomoth', level: 31, type: 'bug' },
    50: { toId: 51, toName: 'Dugtrio', level: 26, type: 'ground' },
    52: { toId: 53, toName: 'Persian', level: 28, type: 'normal' },
    54: { toId: 55, toName: 'Golduck', level: 33, type: 'water' },
    56: { toId: 57, toName: 'Primeape', level: 28, type: 'fighting' },
    58: { toId: 59, toName: 'Arcanine', level: 30, type: 'fire' },
    60: { toId: 61, toName: 'Poliwhirl', level: 25, type: 'water' },
    61: { toId: 62, toName: 'Poliwrath', level: 36, type: 'water' },
    63: { toId: 64, toName: 'Kadabra', level: 16, type: 'psychic' },
    64: { toId: 65, toName: 'Alakazam', level: 36, type: 'psychic' },
    66: { toId: 67, toName: 'Machoke', level: 28, type: 'fighting' },
    67: { toId: 68, toName: 'Machamp', level: 36, type: 'fighting' },
    69: { toId: 70, toName: 'Weepinbell', level: 21, type: 'grass' },
    70: { toId: 71, toName: 'Victreebel', level: 36, type: 'grass' },
    72: { toId: 73, toName: 'Tentacruel', level: 30, type: 'water' },
    74: { toId: 75, toName: 'Graveler', level: 25, type: 'rock' },
    75: { toId: 76, toName: 'Golem', level: 36, type: 'rock' },
    77: { toId: 78, toName: 'Rapidash', level: 40, type: 'fire' },
    79: { toId: 80, toName: 'Slowbro', level: 37, type: 'water' },
    81: { toId: 82, toName: 'Magneton', level: 30, type: 'electric' },
    84: { toId: 85, toName: 'Dodrio', level: 31, type: 'flying' },
    86: { toId: 87, toName: 'Dewgong', level: 34, type: 'ice' },
    88: { toId: 89, toName: 'Muk', level: 38, type: 'poison' },
    90: { toId: 91, toName: 'Cloyster', level: 30, type: 'water' },
    92: { toId: 93, toName: 'Haunter', level: 25, type: 'ghost' },
    93: { toId: 94, toName: 'Gengar', level: 36, type: 'ghost' },
    96: { toId: 97, toName: 'Hypno', level: 26, type: 'psychic' },
    98: { toId: 99, toName: 'Kingler', level: 28, type: 'water' },
    100: { toId: 101, toName: 'Electrode', level: 30, type: 'electric' },
    102: { toId: 103, toName: 'Exeggutor', level: 30, type: 'grass' },
    104: { toId: 105, toName: 'Marowak', level: 28, type: 'ground' },
    109: { toId: 110, toName: 'Weezing', level: 35, type: 'poison' },
    111: { toId: 112, toName: 'Rhydon', level: 42, type: 'ground' },
    116: { toId: 117, toName: 'Seadra', level: 32, type: 'water' },
    118: { toId: 119, toName: 'Seaking', level: 33, type: 'water' },
    120: { toId: 121, toName: 'Starmie', level: 30, type: 'water' },
    129: { toId: 130, toName: 'Gyarados', level: 20, type: 'water' },
    133: { toId: 134, toName: 'Vaporeon', level: 25, type: 'water' },
    138: { toId: 139, toName: 'Omastar', level: 40, type: 'rock' },
    140: { toId: 141, toName: 'Kabutops', level: 40, type: 'rock' },
    147: { toId: 148, toName: 'Dragonair', level: 30, type: 'dragon' },
    148: { toId: 149, toName: 'Dragonite', level: 55, type: 'dragon' }
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
    activeRosterIndex: 0,
    activeJourney: null,
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