// ============================================================================
// BATTLE ENGINE & COMBAT SYSTEM (battle.js)
// ============================================================================

// --- POKÉDEX SPAWN POOLS ---
// Stage 1 / Base Form Pokémon ONLY (For Regular Stages)
const BASE_POKEMON_IDS = [
    1, 4, 7, 10, 13, 16, 19, 21, 23, 25, 27, 29, 32, 35, 37, 39, 41, 43, 46, 48, 
    50, 52, 54, 56, 58, 60, 63, 66, 69, 72, 74, 77, 79, 81, 83, 84, 86, 88, 90, 
    92, 95, 96, 98, 100, 102, 104, 108, 109, 111, 113, 114, 115, 116, 118, 120, 
    122, 123, 124, 125, 126, 127, 128, 129, 131, 132, 133, 137, 138, 140, 142, 143, 147
];

// Evolved Forms (Exclusively for Boss Stages Every 5 Levels)
const EVOLVED_BOSS_IDS = [
    2, 3, 5, 6, 8, 9, 11, 12, 14, 15, 17, 18, 20, 22, 24, 26, 28, 30, 31, 33, 34, 
    36, 38, 40, 42, 44, 45, 47, 49, 51, 53, 55, 57, 59, 61, 62, 64, 65, 67, 68, 
    70, 71, 73, 75, 76, 78, 80, 82, 85, 87, 89, 91, 93, 94, 97, 99, 101, 103, 
    105, 106, 107, 110, 112, 117, 119, 121, 130, 134, 135, 136, 139, 141, 148, 149
];

// --- BATTLE STATE VARIABLES ---
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

    // Slot 1 (Status Debuff with 4-Turn Cooldown Engine)
    const btn1 = document.getElementById('btn-move-1');
    if (btn1) {
        if (statusCooldown > 0) {
            btn1.disabled = true;
            document.getElementById('move-name-1').innerText = `⏳ ${typeData.moves[1].name} (${statusCooldown})`;
            document.getElementById('move-type-1').innerText = `Cooldown (${statusCooldown}T)`;
        } else {
            btn1.disabled = false;
            document.getElementById('move-name-1').innerText = typeData.moves[1].name;
            document.getElementById('move-type-1').innerText = typeData.moves[1].desc;
        }
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

// --- ENTER BATTLE ---
function enterBattle() {
    if(gameState.hearts <= 1) {
        showModal(`${gameState.name} is too sad to battle!`); return;
    }
    if(gameState.hearts <= 3 && Math.random() > 0.5) {
        showModal(`${gameState.name} refused to battle!`); return;
    }

    showScreen('battle-screen');
    enemyLevel = gameState.currentStage;

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
    
    // Reset Battle Stats & Cooldowns for New Encounter
    battleDamageDealt = 0;
    battleDamageReceived = 0;
    statusCooldown = 0;
    setAttackButtonsDisabled(false);

    // --- CALCULATE & DISPLAY BATTLE CP BADGES ---
    let playerCP = (gameState.maxHp || 0) + (gameState.attack || 0) + (gameState.defense || 0) + (gameState.spAtk || 0) + (gameState.spDef || 0) + (gameState.speed || 0);
    let enemyCP = eMaxHp + Math.floor(enemyAttack * 1.5) + Math.floor(enemyDefense * 1.5) + Math.floor(enemyLevel * 2);

    const playerCpEl = document.getElementById('battle-player-cp');
    const enemyCpEl = document.getElementById('battle-enemy-cp');
    if (playerCpEl) playerCpEl.innerText = `CP ${playerCP}`;
    if (enemyCpEl) enemyCpEl.innerText = `CP ${enemyCP}`;

    updateStageNavigatorUI();

    // Update Player Type & Enemy Type Badges
    updateTypeBadge('player-type-badge', gameState.type || 'grass');

    const allTypes = Object.keys(TYPE_DATABASE);
    // Deterministic fallback type matching the stage
    enemyType = allTypes[(enemyLevel * 3) % allTypes.length];
    updateTypeBadge('enemy-type-badge', enemyType);

    // --- STAGE-LOCKED SPAWN ENGINE (100% PERSISTENT PER STAGE) ---
    let wildId;
    if (enemyLevel === 100) {
        wildId = 150; // 👑 LEVEL 100 FINAL BOSS: MEWTWO
        isBoss = true;
    } else if (enemyLevel === 90) {
        wildId = 151; // 🌟 LEVEL 90 MYTHICAL BOSS: MEW
        isBoss = true;
    } else if (enemyLevel === 80) {
        wildId = 146; // 🔥 LEVEL 80 BOSS: MOLTRES
        isBoss = true;
    } else if (enemyLevel === 70) {
        wildId = 145; // ⚡ LEVEL 70 BOSS: ZAPDOS
        isBoss = true;
    } else if (enemyLevel === 60) {
        wildId = 144; // ❄️ LEVEL 60 BOSS: ARTICUNO
        isBoss = true;
    } else if (isBoss) {
        // Boss stages are deterministically locked to a specific evolved Pokémon!
        let bossIndex = (enemyLevel * 7) % EVOLVED_BOSS_IDS.length;
        wildId = EVOLVED_BOSS_IDS[bossIndex];
    } else {
        // Regular stages are permanently locked to a specific Base Pokémon!
        let baseIndex = (enemyLevel * 13 + 5) % BASE_POKEMON_IDS.length;
        wildId = BASE_POKEMON_IDS[baseIndex];
    }

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

// --- PLAYER ATTACK ---
function playerAttack(slot = 0) {
    setAttackButtonsDisabled(true);

    const pType = gameState.type || 'grass';
    const typeData = TYPE_DATABASE[pType] || TYPE_DATABASE.normal;
    
    // Support string fallbacks for unit tests
    let moveIndex = (typeof slot === 'number') ? slot : (slot === 'growl' ? 1 : (slot === 'vinewhip' ? 2 : (slot === 'leechseed' || slot === 'razorleaf' ? 3 : 0)));
    const move = typeData.moves[moveIndex];

    // --- 1. MISS CHANCE (0.5% Chance to Miss) ---
    if (typeof slot === 'number' && Math.random() < 0.005) {
        setBattleLog(`💨 ${gameState.name}'s ${move.name} MISSED!`);
        spawnFloatingText('enemy-sprite-wrapper', '💨 MISSED!', 'heal');
        setTimeout(enemyTurn, 1000);
        return;
    }

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

    // --- 2. CRITICAL HIT CALCULATION ---
    let isCrit = (typeof slot === 'number') && (move.type !== 'status') && ((Math.random() * 100) < (gameState.critRate || 5.0));

    // --- COOLDOWN TRACKING ---
    if (move.type === 'status') {
        statusCooldown = 4;
    } else if (statusCooldown > 0) {
        statusCooldown--;
    }

    let damage = 0;

    if (move.type === 'status') {
        // --- SLOT 1: STATUS DEBUFF ---
        enemyAttack = Math.max(1, enemyAttack - 2);
        enemyDefense = Math.max(0, enemyDefense - 4);
        setBattleLog(`${gameState.name} used ${move.name}! Enemy stats were shredded! (4T Cooldown)`);

    } else if (move.type === 'special') {
        // --- SLOT 2: ELEMENTAL SPECIAL ---
        let defenseMitigation = Math.floor(enemyDefense / 5);
        let baseDmg = Math.max(1, Math.floor(gameState.spAtk * move.power) - defenseMitigation);
        let rawDmg = isCrit ? Math.floor(baseDmg * 1.75) : baseDmg;
        damage = Math.max(1, Math.floor(rawDmg * multiplier));
        eHp -= damage;
        setBattleLog(`${isCrit ? '💥 CRIT! ' : ''}${move.name} hit for ${damage} Sp. Dmg!${typeEffectText}`);

    } else if (move.type === 'ultimate') {
        // --- SLOT 3: ULTIMATE MOVE ---
        let defenseMitigation = Math.floor(enemyDefense / 6);
        let baseDmg = Math.max(1, Math.floor((gameState.attack + gameState.spAtk) * move.power * 0.7) - defenseMitigation);
        let rawDmg = isCrit ? Math.floor(baseDmg * 1.75) : baseDmg;
        damage = Math.max(1, Math.floor(rawDmg * multiplier));
        
        if (pType === 'grass' || pType === 'poison') {
            let heal = Math.max(1, Math.floor(damage * 0.5));
            pHp = Math.min(gameState.maxHp, pHp + heal);
            setBattleLog(`${isCrit ? '💥 CRIT! ' : ''}${move.name} dealt ${damage} dmg & drained ${heal} HP!${typeEffectText}`);
        } else {
            setBattleLog(`${isCrit ? '💥 CRIT! ' : ''}${move.name} blasted foe for ${damage} Damage!${typeEffectText}`);
        }
        eHp -= damage;

    } else {
        // --- SLOT 0: BASIC PHYSICAL ATTACK ---
        let defenseMitigation = Math.floor(enemyDefense / 4);
        let baseDmg = Math.max(1, gameState.attack - defenseMitigation);
        damage = isCrit ? Math.floor(baseDmg * 1.75) : baseDmg;
        eHp -= damage;
        setBattleLog(`${isCrit ? '💥 CRIT! ' : ''}${gameState.name} used ${move.name} for ${damage} damage!`);
    }

    // Accumulate damage
    if (damage > 0) {
        battleDamageDealt += damage;
    }

    // --- TRIGGER FLOATING TEXT & REACTION ---
    if (move.type !== 'status') {
        triggerHitReaction('enemy-sprite');
        spawnFloatingText('enemy-sprite-wrapper', `-${damage}`, isCrit ? 'crit' : ((multiplier === 2.0) ? 'super' : 'damage'));

        if (isCrit) {
            setTimeout(() => spawnFloatingText('enemy-sprite-wrapper', '💥 CRITICAL HIT!', 'crit'), 120);
        } else if (multiplier === 2.0) {
            setTimeout(() => spawnFloatingText('enemy-sprite-wrapper', '🔥 SUPER EFFECTIVE!', 'super'), 120);
        } else if (multiplier === 0.5) {
            setTimeout(() => spawnFloatingText('enemy-sprite-wrapper', '💧 RESISTED (0.5x)', 'damage'), 120);
        }

        if (move.type === 'ultimate' && (pType === 'grass' || pType === 'poison')) {
            let healAmt = Math.max(1, Math.floor(damage * 0.5));
            spawnFloatingText('player-sprite-wrapper', `+${healAmt} HP`, 'heal');
        }
    } else {
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

// --- ENEMY TURN ---
function enemyTurn() {
    const pType = gameState.type || 'grass';
    const eTypeData = TYPE_DATABASE[enemyType] || TYPE_DATABASE.normal;

    // --- ENEMY MISS CHANCE (0.5% Chance) ---
    if (Math.random() < 0.005) {
        setBattleLog(`💨 ${enemyBaseName}'s attack MISSED!`);
        spawnFloatingText('player-sprite-wrapper', '💨 DODGED!', 'heal');
        setAttackButtonsDisabled(false);
        return;
    }

    // Pick a Real Named Move based on Enemy Level
    let availableMoveCount = enemyLevel >= 13 ? 4 : (enemyLevel >= 7 ? 3 : 2);
    let moveIndex = Math.floor(Math.random() * availableMoveCount);
    let chosenMove = eTypeData.moves[moveIndex];

    // Base Damage & Enemy Crit (3% chance)
    let isEnemyCrit = (Math.random() * 100) < 3.0;
    let baseDamage = Math.max(1, enemyAttack - Math.floor(gameState.defense / 4));
    if (chosenMove.type === 'special' || chosenMove.type === 'ultimate') {
        baseDamage = Math.floor(baseDamage * (chosenMove.power || 1.35));
    }
    if (isEnemyCrit) {
        baseDamage = Math.floor(baseDamage * 1.5); // 1.5x enemy crit
    }

    // 18-Type Matchup against Player
    let enemyMultiplier = getTypeMultiplier(enemyType, pType);
    let damage = baseDamage;
    let enemyEffectText = "";

    if (enemyMultiplier === 2.0) {
        damage = Math.max(1, Math.floor(baseDamage * 1.4));
        enemyEffectText = " 🔥 Super effective on you!";
    } else if (enemyMultiplier === 0.5) {
        damage = Math.max(1, Math.floor(baseDamage * 0.7));
        enemyEffectText = " 🛡️ You resisted the hit!";
    }

    pHp -= damage;
    battleDamageReceived += damage;
    setBattleLog(`${isEnemyCrit ? '💥 CRIT! ' : ''}${enemyBaseName} used ${chosenMove.name} for ${damage} damage!${enemyEffectText}`);
    
    // Player Hit Reaction & Floating Text
    triggerHitReaction('battle-player-sprite');
    spawnFloatingText('player-sprite-wrapper', `-${damage}`, isEnemyCrit ? 'crit' : ((enemyMultiplier === 2.0) ? 'super' : 'damage'));
    
    if (isEnemyCrit) {
        setTimeout(() => spawnFloatingText('player-sprite-wrapper', '💥 CRITICAL HIT!', 'crit'), 120);
    } else if (enemyMultiplier === 2.0) {
        setTimeout(() => spawnFloatingText('player-sprite-wrapper', '🔥 SUPER EFFECTIVE!', 'super'), 120);
    } else if (enemyMultiplier === 0.5) {
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

// --- END BATTLE (VICTORY / DEFEAT / REWARDS) ---
function endBattle(won) {
    if(won) {
        let beatenStage = gameState.currentStage;
        let isNewRecord = (gameState.currentStage === gameState.maxStage);

        // Advance stage if player beat their highest unlocked stage
        if (isNewRecord) {
            gameState.maxStage++;
            gameState.currentStage++; 
        }

        // 1. Calculate Dynamic Stage-Scaled XP (50% XP for Replay Farming!)
        let baseStageXp = Math.floor(10 + (beatenStage * 2.5));
        let replayTag = "";

        if (!isNewRecord) {
            baseStageXp = Math.max(5, Math.floor(baseStageXp * 0.5)); // <-- 50% XP for Replaying Old Stages!
            replayTag = " <span class='text-[10px] text-yellow-300'>(Replay: 50% XP)</span>";
        }

        let multiplier = (gameState.hearts <= 1) ? 0 : (gameState.hearts <= 3 ? 0.5 : (gameState.hearts <= 5 ? 2 : 3));
        let earnedXp = Math.floor(baseStageXp * multiplier);

        // 2. Calculate Loot Drops (Berries, Pokéballs & Rare XL Stat Slicers!)
        let drops = [];
        if (!gameState.pokeballs) gameState.pokeballs = 0;
        if (!gameState.items) gameState.items = { hpXL: 0, atkXL: 0, defXL: 0, spAtkXL: 0, spDefXL: 0, speedXL: 0, critXL: 0 };

        const xlKeys = Object.keys(XL_ITEM_CONFIG);

        if (isBoss) {
            // --- GUARANTEED BOSS REWARDS ---
            let isMilestoneBoss = (beatenStage % 25 === 0);
            let bossBalls = isMilestoneBoss ? (Math.floor(Math.random() * 3) + 3) : (Math.floor(Math.random() * 2) + 1);
            let bossBerries = Math.floor(Math.random() * 3) + 3;

            gameState.berries += bossBerries;
            gameState.pokeballs += bossBalls;

            drops.push(`<span class='text-pink-400 font-bold'>+${bossBerries} 🍓 Berries</span>`);
            drops.push(`<span class='text-red-400 font-bold'>+${bossBalls} 🔴 Pokéballs</span>`);

            // Guaranteed Rare XL Stat Slicer Drop on Bosses!
            let randomXL = xlKeys[Math.floor(Math.random() * xlKeys.length)];
            gameState.items[randomXL] = (gameState.items[randomXL] || 0) + 1;
            drops.push(`<span class='text-yellow-400 font-bold'>+1 ${XL_ITEM_CONFIG[randomXL].icon} ${XL_ITEM_CONFIG[randomXL].name}</span>`);

            if (isMilestoneBoss) {
                let bonusXL = xlKeys[Math.floor(Math.random() * xlKeys.length)];
                gameState.items[bonusXL] = (gameState.items[bonusXL] || 0) + 1;
                drops.push(`<span class='text-yellow-400 font-bold'>+1 ${XL_ITEM_CONFIG[bonusXL].icon} ${XL_ITEM_CONFIG[bonusXL].name}</span>`);
            }
        } else {
            // --- REGULAR WILD STAGE REWARDS ---
            if (Math.random() < 0.45) {
                let foundBerries = Math.floor(Math.random() * 2) + 1;
                gameState.berries += foundBerries;
                drops.push(`<span class='text-pink-400 font-bold'>+${foundBerries} 🍓 Berry</span>`);
            }
            if (Math.random() < 0.11) {
                gameState.pokeballs += 1;
                drops.push(`<span class='text-red-400 font-bold'>+1 🔴 Pokéball</span>`);
            }
            // 10% Lucky Chance to find a Rare XL Stat Slicer in the wild!
            if (Math.random() < 0.10) {
                let luckyXL = xlKeys[Math.floor(Math.random() * xlKeys.length)];
                gameState.items[luckyXL] = (gameState.items[luckyXL] || 0) + 1;
                drops.push(`<span class='text-yellow-400 font-bold'>+1 ${XL_ITEM_CONFIG[luckyXL].icon} ${XL_ITEM_CONFIG[luckyXL].name}</span>`);
            }
        }

        let lootText = drops.length > 0 ? drops.join(" <span class='text-gray-500'>•</span> ") : "<span class='text-gray-400'>None</span>";

        // 3. Assemble Rich Victory Card with Combat Analytics
        let title = isBoss ? `👑 BOSS CLEARED!` : `🏆 VICTORY!`;
        let progressMsg = isNewRecord 
            ? `<span class='text-yellow-400 font-black'>🌟 Stage ${gameState.maxStage} Unlocked!</span>` 
            : `<span class='text-gray-400'>🔄 Stage ${beatenStage} Cleared</span>`;

        let victoryCard = `
            <div class='bg-gray-900/80 p-4 rounded-xl border border-gray-700 text-left text-sm space-y-2 mt-2 shadow-inner'>
                <div>⚡ <strong class='text-white'>XP Gained:</strong> <span class='text-green-400 font-bold'>+${earnedXp} XP</span> <span class='text-[10px] text-gray-400'>(${multiplier}x Mood)</span>${replayTag}</div>
                <div>🎁 <strong class='text-white'>Loot:</strong> ${lootText}</div>
                <div>⚔️ <strong class='text-white'>Combat:</strong> <span class='text-orange-400 font-bold'>${battleDamageDealt}</span> Dealt • <span class='text-blue-400 font-bold'>${battleDamageReceived}</span> Taken</div>
                <div class='pt-2 border-t border-gray-800'>${progressMsg}</div>
            </div>
        `.trim();

        updateHub();
        showModal(title, victoryCard, [40, 60, 40]);
        
        // Switch to hub FIRST, then trigger XP animation
        showScreen('hub-screen');
        setTimeout(() => addXP(baseStageXp), 300);
    } else {
        // --- RICH DEFEAT CARD ---
        gameState.hearts = Math.max(0, gameState.hearts - 2); 
        updateHub();

        let defeatCard = `
            <div class='bg-gray-900/80 p-4 rounded-xl border border-red-900/60 text-left text-sm space-y-2.5 mt-2 shadow-inner'>
                <div class='text-gray-300'>${gameState.name} was overwhelmed on <strong class='text-yellow-400'>Stage ${gameState.currentStage}</strong>!</div>
                <div>⚔️ <strong class='text-white'>Combat:</strong> <span class='text-orange-400 font-bold'>${battleDamageDealt}</span> Dealt • <span class='text-red-400 font-bold'>${battleDamageReceived}</span> Taken</div>
                <div class='pt-2 border-t border-gray-800 text-xs text-red-400 font-semibold'>💔 Lost 2 Hearts (Feed berries or pet to recover!)</div>
            </div>
        `.trim();

        showModal("💀 BLACKED OUT...", defeatCard, [80, 80]);
        showScreen('hub-screen');
    }
}