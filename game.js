// Game State
var gameState = {
    id: 1, name: 'Bulbasaur', level: 5, xp: 0, maxXp: 100, 
    hearts: 2, attack: 10, defense: 10, maxHp: 80,
    spAtk: 12, spDef: 12, speed: 9,
    berries: 5, lastInteraction: Date.now(), enemyLevel: 3,
    gardenBerries: 1, lastGardenHarvest: Date.now() // <-- Idle Berry Bush State
};

// Background Interval: Handles Heart Loss & Berry Bush Growth (1 berry every 2 minutes)
setInterval(() => {
    const isHubVisible = !document.getElementById('hub-screen').classList.contains('hidden');
    const isTabActive = document.visibilityState === 'visible';

    // Heart Depletion
    if (gameState.hearts > 0 && isHubVisible && isTabActive) {
        gameState.hearts--;
        gameState.lastInteraction = Date.now();
    }

    // Berry Garden Growth (Grows up to 5 berries max)
    if (gameState.gardenBerries < 5 && (Date.now() - gameState.lastGardenHarvest) >= 120000) {
        gameState.gardenBerries = Math.min(5, gameState.gardenBerries + 1);
        gameState.lastGardenHarvest = Date.now();
    }

    if (isHubVisible) updateHub();
}, 30000);

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
        if (gameState.enemyLevel === undefined) gameState.enemyLevel = 3;
        if (gameState.spAtk === undefined) gameState.spAtk = 12;
        if (gameState.spDef === undefined) gameState.spDef = 12;
        if (gameState.speed === undefined) gameState.speed = 9;
        if (gameState.gardenBerries === undefined) gameState.gardenBerries = 1;
        if (!gameState.lastGardenHarvest) gameState.lastGardenHarvest = Date.now();
        if (!gameState.lastInteraction) gameState.lastInteraction = Date.now();

        // Calculate offline Berry Bush growth (1 berry per 2 minutes offline, max 5)
        let gardenMins = Math.floor((Date.now() - gameState.lastGardenHarvest) / 120000);
        if (gardenMins > 0) {
            gameState.gardenBerries = Math.min(5, gameState.gardenBerries + gardenMins);
            gameState.lastGardenHarvest = Date.now();
        }

        // Calculate offline heart depletion (1 heart lost per minute offline)
        let minutesOffline = Math.floor((Date.now() - gameState.lastInteraction) / 60000);
        if (minutesOffline > 0) {
            gameState.hearts = Math.max(0, gameState.hearts - minutesOffline);
            gameState.lastInteraction = Date.now();
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
    
    // Update Berries
    if(document.getElementById('berry-count')) {
        document.getElementById('berry-count').innerText = gameState.berries;
    }

    // Update Idle Berry Bush UI
    const bushCount = document.getElementById('bush-count');
    const bushIcon = document.getElementById('bush-icon');
    if (bushCount && bushIcon) {
        if (gameState.gardenBerries > 0) {
            bushIcon.innerText = '🍓';
            bushCount.innerText = `${gameState.gardenBerries} Ready!`;
            bushCount.className = 'text-xs font-black text-pink-400 animate-pulse';
        } else {
            bushIcon.innerText = '🌳';
            bushCount.innerText = 'Growing...';
            bushCount.className = 'text-xs font-semibold text-gray-400';
        }
    }

    localStorage.setItem('pokeSave', JSON.stringify(gameState));
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

// Custom Native-feeling Modal & Vibration System
function showModal(title, text = '', vibratePattern = [50]) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-desc').innerText = text || '';
    
    const modal = document.getElementById('custom-modal');
    const content = document.getElementById('modal-content');
    
    modal.classList.remove('hidden');
    // Tiny delay to allow CSS to animate
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        content.classList.remove('scale-95');
        content.classList.add('scale-100');
    }, 10);

    // Trigger iPhone haptics if supported
    if (navigator.vibrate) {
        navigator.vibrate(vibratePattern);
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
    }, 300);
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
function updateEnemyTypeBadge() {
    const badge = document.getElementById('enemy-type-badge');
    if (!badge) return;
    
    const typeConfig = {
        water: { text: "Water 💧", class: "bg-blue-600 text-white" },
        fire: { text: "Fire 🔥", class: "bg-red-600 text-white animate-pulse" },
        grass: { text: "Grass 🌿", class: "bg-green-600 text-white" },
        electric: { text: "Electric ⚡", class: "bg-yellow-500 text-black font-bold" },
        normal: { text: "Normal ⭐", class: "bg-gray-600 text-white" }
    };

    let config = typeConfig[enemyType] || typeConfig.normal;
    badge.innerText = config.text;
    badge.className = `text-[9px] px-2 py-0.5 rounded-full font-black uppercase shadow-md ${config.class}`;
}

// --- TYPE EFFECTIVENESS CALCULATOR ---
function getTypeMultiplier(moveType) {
    if (moveType === 'tackle' || moveType === 'growl') return 1.0; // Normal moves are always 1x

    // Grass Moves (Vine Whip, Leech Seed, Razor Leaf)
    if (enemyType === 'water') return 2.0; // SUPER EFFECTIVE!
    if (enemyType === 'fire' || enemyType === 'grass') return 0.5; // NOT VERY EFFECTIVE...
    return 1.0; // Neutral against Electric & Normal
}

function updateBattleMoveButtons() {
    const btnVine = document.getElementById('btn-move-vinewhip');
    const labelVine = document.getElementById('label-vinewhip');
    const btnSpecial = document.getElementById('btn-move-special');
    const labelSpecial = document.getElementById('label-special');
    const descSpecial = document.getElementById('desc-special');

    // Level 7: Vine Whip
    if (gameState.level >= 7) {
        btnVine.disabled = false;
        labelVine.innerText = "🌿 Vine Whip";
    } else {
        btnVine.disabled = true;
        labelVine.innerText = "🔒 Vine Whip";
    }

    // Level 13 (Leech Seed) & Level 18 (Razor Leaf)
    if (gameState.level >= 18) {
        btnSpecial.disabled = false;
        labelSpecial.innerText = "🍃 Razor Leaf";
        descSpecial.innerText = "High Crit (Lv. 18)";
        btnSpecial.setAttribute('onclick', "playerAttack('razorleaf')");
    } else if (gameState.level >= 13) {
        btnSpecial.disabled = false;
        labelSpecial.innerText = "🌱 Leech Seed";
        descSpecial.innerText = "Drain HP (Lv. 13)";
        btnSpecial.setAttribute('onclick', "playerAttack('leechseed')");
    } else {
        btnSpecial.disabled = true;
        labelSpecial.innerText = "🔒 Leech Seed";
        descSpecial.innerText = "Unlocks Lv. 13";
    }
}

function setAttackButtonsDisabled(disabled) {
    if (disabled) {
        const btns = document.querySelectorAll('#move-grid button');
        btns.forEach(btn => { btn.disabled = true; });
    } else {
        document.getElementById('btn-move-tackle').disabled = false;
        document.getElementById('btn-move-growl').disabled = false;
        updateBattleMoveButtons();
    }
}

function setBattleLog(msg) {
    const logEl = document.getElementById('battle-log');
    if (logEl) logEl.innerText = msg;
}

function enterBattle() {
    if(gameState.hearts <= 1) {
        showModal(`${gameState.name} is too sad to battle!`); return;
    }
    if(gameState.hearts <= 3 && Math.random() > 0.5) {
        showModal(`${gameState.name} refused to battle!`); return;
    }

    showScreen('battle-screen');
    enemyLevel = gameState.enemyLevel;

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

    // Default Random Type Fallback
    const randomTypes = ['water', 'fire', 'grass', 'electric', 'normal'];
    enemyType = randomTypes[Math.floor(Math.random() * randomTypes.length)];
    updateEnemyTypeBadge();

    // Load Wild Pokemon
    let wildId = Math.floor(Math.random() * 150) + 1;
    document.getElementById('enemy-sprite').src = `assets/sprites/${wildId}_animated.gif`;
    document.getElementById('enemy-sprite').onerror = function() {
        this.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${wildId}.gif`;
    };

    enemyBaseName = isBoss ? "👑 BOSS" : "Wild Pokemon";
    document.getElementById('enemy-name').innerText = `${enemyBaseName} (Lv. ${enemyLevel})`;
    
    // Fetch Real Canonical Type from PokeAPI
    fetch(`https://pokeapi.co/api/v2/pokemon/${wildId}`)
        .then(res => res.json())
        .then(data => {
            let capitalized = data.name.charAt(0).toUpperCase() + data.name.slice(1);
            enemyBaseName = isBoss ? `👑 BOSS ${capitalized}` : `Wild ${capitalized}`;
            document.getElementById('enemy-name').innerText = `${enemyBaseName} (Lv. ${enemyLevel})`;
            
            if (data.types && data.types[0]) {
                enemyType = data.types[0].type.name;
                updateEnemyTypeBadge();
            }
        })
        .catch(err => console.log(err));

    document.getElementById('battle-player-sprite').src = document.getElementById('hub-sprite').src;
    document.getElementById('battle-player-name').innerText = `${gameState.name} (Lv. ${gameState.level})`;

    setBattleLog(isBoss ? `⚠️ WARNING: A POWERFUL BOSS APPEARED!` : `A wild foe appeared!`);
    updateHealthBars();
}

function playerAttack(moveType = 'tackle') {
    setAttackButtonsDisabled(true);

    let multiplier = getTypeMultiplier(moveType);
    let typeEffectText = "";
    
    if (multiplier === 2.0) {
        typeEffectText = " 🔥 It's SUPER EFFECTIVE!";
        // Trigger Super Effective Slash Animation
        const fx = document.getElementById('elemental-fx');
        if (fx) {
            fx.classList.remove('hidden');
            setTimeout(() => fx.classList.add('hidden'), 450);
        }
        if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
    } else if (multiplier === 0.5) {
        typeEffectText = " 💧 It's not very effective...";
    }

    if (moveType === 'growl') {
        enemyAttack = Math.max(1, enemyAttack - 2);
        enemyDefense = Math.max(0, enemyDefense - 4);
        setBattleLog(`${gameState.name} used Growl! Enemy stats dropped!`);

    } else if (moveType === 'vinewhip') {
        let defenseMitigation = Math.floor(enemyDefense / 5);
        let baseDmg = Math.max(1, Math.floor(gameState.spAtk * 1.35) - defenseMitigation);
        let damage = Math.max(1, Math.floor(baseDmg * multiplier));
        eHp -= damage;
        setBattleLog(`🌿 ${gameState.name} used Vine Whip for ${damage} Sp. Dmg!${typeEffectText}`);

    } else if (moveType === 'leechseed') {
        let baseDmg = Math.max(1, Math.floor(gameState.spAtk * 0.95) - Math.floor(enemyDefense / 6));
        let damage = Math.max(1, Math.floor(baseDmg * multiplier));
        let heal = Math.max(1, Math.floor(damage * 0.60));
        eHp -= damage;
        pHp = Math.min(gameState.maxHp, pHp + heal);
        setBattleLog(`🌱 Leech Seed dealt ${damage} dmg & drained ${heal} HP!${typeEffectText}`);

    } else if (moveType === 'razorleaf') {
        let isCrit = Math.random() < 0.40;
        let baseDmg = Math.floor((gameState.attack + gameState.spAtk) * 0.85);
        let rawDmg = isCrit ? baseDmg * 2 : baseDmg;
        let damage = Math.max(1, Math.floor((rawDmg - Math.floor(enemyDefense / 5)) * multiplier));
        eHp -= damage;
        setBattleLog(isCrit ? `💥 CRITICAL HIT! Razor Leaf dealt ${damage} dmg!${typeEffectText}` : `🍃 ${gameState.name} used Razor Leaf for ${damage} dmg!${typeEffectText}`);

    } else {
        // Tackle (Normal)
        let defenseMitigation = Math.floor(enemyDefense / 4);
        let damage = Math.max(1, gameState.attack - defenseMitigation);
        eHp -= damage;
        setBattleLog(`💥 ${gameState.name} used Tackle for ${damage} damage!`);
    }

    // Shake Animation
    document.getElementById('enemy-sprite').style.transform = 'translate(40px) scale(1.1)';
    setTimeout(() => document.getElementById('enemy-sprite').style.transform = 'translate(40px)', 100);

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
        gameState.enemyLevel++;
        updateHub();
        let lootMsg = "You won!";
        
        // --- Boss Guaranteed Huge Loot ---
        if (isBoss) {
            let bossBerries = Math.floor(Math.random() * 3) + 3; // 3 to 5 Berries!
            gameState.berries += bossBerries;
            lootMsg = `🎉 DEFEATED THE BOSS! Received ${bossBerries} 🍓 Berries!`;
        } else if (Math.random() < 0.40) {
            let foundBerries = Math.floor(Math.random() * 2) + 1; 
            gameState.berries += foundBerries;
            lootMsg += ` And found ${foundBerries} 🍓 Berry!`;
        }
        showModal(lootMsg);
        
        // Switch to hub FIRST, then trigger the XP animation
        showScreen('hub-screen');
        setTimeout(() => addXP(50), 300); // Small delay to let screen transition finish
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