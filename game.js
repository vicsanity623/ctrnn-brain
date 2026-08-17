// Game State
var gameState = {
    id: 1, name: 'Bulbasaur', level: 5, xp: 0, maxXp: 100, 
    hearts: 2, attack: 10, defense: 10, maxHp: 50,
    spAtk: 12, spDef: 12, speed: 9,
    berries: 5, lastInteraction: Date.now(), enemyLevel: 3
};

// Heart Depletion Interval (Loses 1 heart every 60 seconds)
// Only deplete hearts if the tab is active and player is on the hub screen
setInterval(() => {
    const isHubVisible =!document.getElementById('hub-screen').classList.contains('hidden');
    const isTabActive = document.visibilityState === 'visible';

    if (gameState.hearts > 0 && isHubVisible && isTabActive) {
        gameState.hearts--;
        gameState.lastInteraction = Date.now();
        updateHub();
    }
}, 60000);

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
        if (!gameState.lastInteraction) gameState.lastInteraction = Date.now();

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

    localStorage.setItem('pokeSave', JSON.stringify(gameState));
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
    e.preventDefault();
    isSwirling = true;
    touchTimer = setTimeout(() => {
        if(isSwirling) gainHeart();
    }, 2000); // Reduced to 2 seconds so it feels more responsive
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
            showModal(`${gameState.name} is completely full and happy!`);
        }
    } else {
        showModal("You don't have any berries left! Win battles to find more.");
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
    
    // Stat gains based on mood
    let statBuff = gameState.hearts >= 5 ? 1.10 : (gameState.hearts >= 3 ? 1.05 : 1.0);
    gameState.maxHp = Math.floor(gameState.maxHp * statBuff);
    gameState.attack = Math.floor(gameState.attack * statBuff);
    gameState.defense = Math.floor(gameState.defense * statBuff);
    gameState.spAtk = Math.floor(gameState.spAtk * statBuff);
    gameState.spDef = Math.floor(gameState.spDef * statBuff);
    gameState.speed = Math.floor(gameState.speed * statBuff);

    // Instantly snap XP bar back to 0 without animation
    let xpBar = document.getElementById('xp-bar');
    xpBar.style.transition = 'none';
    xpBar.style.width = '0%';

    // Wait 50ms, then turn animations back on and apply the new stats/leftover XP
    setTimeout(() => {
        xpBar.style.transition = 'all 0.5s ease';
        updateHub(); // This animates the bar to the leftover XP amount
        
        if (gameState.level > 10 && Math.random() > 0.5 && gameState.id === 1) {
            triggerEvolution(2, 'Ivysaur');
        } else {
            showModal(`${gameState.name} grew to Level ${gameState.level}!`);
        }
    }, 50);
}

// --- BATTLE SYSTEM ---
var eHp = 100;
var eMaxHp = 100;
var pHp = gameState.maxHp;
var enemyLevel = 1;
var enemyAttack = 10;
var enemyBaseName = "Wild Pokemon";

function setAttackButtonsDisabled(disabled) {
    const btns = document.querySelectorAll('#battle-screen button');
    btns.forEach(btn => { btn.disabled = disabled; });
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
    eMaxHp = 40 + enemyLevel * 10;
    eHp = eMaxHp;
    enemyAttack = 5 + enemyLevel * 2;
    pHp = gameState.maxHp;
    setAttackButtonsDisabled(false);

    // Load Wild Pokemon
    let wildId = Math.floor(Math.random() * 150) + 1;
    document.getElementById('enemy-sprite').src = `assets/sprites/${wildId}_animated.gif`;
    document.getElementById('enemy-sprite').onerror = function() {
        this.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${wildId}.gif`;
    };

    enemyBaseName = "Wild Pokemon";
    document.getElementById('enemy-name').innerText = `${enemyBaseName} (Lv. ${enemyLevel})`;
    fetch(`https://pokeapi.co/api/v2/pokemon/${wildId}`)
        .then(res => res.json())
        .then(data => {
            let capitalized = data.name.charAt(0).toUpperCase() + data.name.slice(1);
            enemyBaseName = "Wild " + capitalized;
            document.getElementById('enemy-name').innerText = `${enemyBaseName} (Lv. ${enemyLevel})`;
        })
        .catch(err => console.log(err));

    document.getElementById('battle-player-sprite').src = document.getElementById('hub-sprite').src;
    document.getElementById('battle-player-name').innerText = `${gameState.name} (Lv. ${gameState.level})`;

    setBattleLog(`A wild foe appeared!`);
    updateHealthBars();
}

function playerAttack(moveType = 'tackle') {
    setAttackButtonsDisabled(true);

    if (moveType === 'growl') {
        enemyAttack = Math.max(1, enemyAttack - 3);
        setBattleLog(`${gameState.name} used Growl! Enemy's attack dropped!`);
    } else {
        let damage = Math.max(1, gameState.attack);
        eHp -= damage;
        setBattleLog(`${gameState.name} used Tackle for ${damage} damage!`);
        document.getElementById('enemy-sprite').style.transform = 'translate(40px) scale(1.1)';
        setTimeout(() => document.getElementById('enemy-sprite').style.transform = 'translate(40px)', 100);
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
    let damage = Math.max(1, enemyAttack - Math.floor(gameState.defense / 4));
    pHp -= damage;
    setBattleLog(`${enemyBaseName} attacked for ${damage} damage!`);
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
        if (Math.random() < 0.40) {
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
        gameState.attack += 20;
        gameState.defense += 20;
        document.getElementById('evo-sprite').classList.remove('brightness-0', 'animate-pulse');
        document.getElementById('evo-sprite').src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${newId}.gif`;
        
        setTimeout(() => {
            showModal(`Your Pokemon evolved into ${newName}!`);
            updateHub();
            showScreen('hub-screen');
        }, 2000);
    }, 3000);
}