// ============================================================================
// INVENTORY & BAG SYSTEM (inventory.js)
// ============================================================================

// (XL_ITEM_CONFIG is loaded globally from global.js)

// --- INVENTORY BAG MODAL TOGGLES ---
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

// --- RENDER INVENTORY ITEMS ---
function renderInventory() {
    const list = document.getElementById('inventory-list');
    if (!list) return;
    list.innerHTML = ''; 
    
    let hasItems = false;

    // 1. Render Oran Berries
    if (gameState.berries > 0) {
        hasItems = true;
        list.innerHTML += `
            <div class="flex justify-between items-center bg-gray-800/90 p-3 rounded-xl border border-gray-700 shadow-md">
                <div class="flex items-center gap-3">
                    <span class="text-3xl drop-shadow">🍓</span>
                    <div>
                        <h4 class="font-bold text-sm text-pink-300">Oran Berry</h4>
                        <p class="text-[10px] text-gray-400">Restores mood & grants XP.</p>
                    </div>
                </div>
                <div class="flex flex-col items-end">
                    <span class="font-black text-lg text-yellow-400">x${gameState.berries}</span>
                    <button onclick="feedBerry(); renderInventory();" class="mt-1 bg-pink-600 px-3 py-1 rounded-lg text-xs font-bold active:scale-90 transition-all shadow">Use</button>
                </div>
            </div>
        `;
    }

    // 2. Render Pokéballs
    if (gameState.pokeballs > 0) {
        hasItems = true;
        list.innerHTML += `
            <div class="flex justify-between items-center bg-gray-800/90 p-3 rounded-xl border border-gray-700 shadow-md">
                <div class="flex items-center gap-3">
                    <span class="text-3xl drop-shadow">🔴</span>
                    <div>
                        <h4 class="font-bold text-sm text-red-300">Pokéball</h4>
                        <p class="text-[10px] text-gray-400">Catch weakened wild Pokémon in battle.</p>
                    </div>
                </div>
                <div class="flex flex-col items-end">
                    <span class="font-black text-lg text-yellow-400">x${gameState.pokeballs}</span>
                    <span class="text-[10px] text-gray-400 font-semibold mt-1">In Battle</span>
                </div>
            </div>
        `;
    }

    // 3. Render Cooked Super Berries (From Campfire)
    if (gameState.items && typeof COOKING_RECIPES !== 'undefined') {
        Object.keys(COOKING_RECIPES).forEach(key => {
            let count = gameState.items[key] || 0;
            if (count > 0) {
                hasItems = true;
                let dish = COOKING_RECIPES[key];
                list.innerHTML += `
                    <div class="flex justify-between items-center bg-gray-800/90 p-3 rounded-xl border border-amber-500/40 shadow-md">
                        <div class="flex items-center gap-3">
                            <span class="text-3xl drop-shadow">${dish.icon}</span>
                            <div>
                                <h4 class="font-bold text-sm ${dish.color}">${dish.name}</h4>
                                <p class="text-[10px] text-gray-400">${dish.desc}</p>
                            </div>
                        </div>
                        <div class="flex flex-col items-end">
                            <span class="font-black text-lg text-yellow-400">x${count}</span>
                            <button onclick="useCookedSuperBerry('${key}')" class="mt-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 px-3 py-1 rounded-lg text-xs font-bold active:scale-90 transition-all shadow">Eat 🍲</button>
                        </div>
                    </div>
                `;
            }
        });
    }

    // 4. Render Rare XL Stat Enhancers
    if (gameState.items) {
        Object.keys(XL_ITEM_CONFIG).forEach(key => {
            let count = gameState.items[key] || 0;
            if (count > 0) {
                hasItems = true;
                let item = XL_ITEM_CONFIG[key];
                list.innerHTML += `
                    <div class="flex justify-between items-center bg-gray-800/90 p-3 rounded-xl border border-gray-700 shadow-md">
                        <div class="flex items-center gap-3">
                            <span class="text-3xl drop-shadow">${item.icon}</span>
                            <div>
                                <h4 class="font-bold text-sm ${item.color}">${item.name}</h4>
                                <p class="text-[10px] text-gray-400">${item.desc}</p>
                            </div>
                        </div>
                        <div class="flex flex-col items-end">
                            <span class="font-black text-lg text-yellow-400">x${count}</span>
                            <button onclick="useStatXL('${key}')" class="mt-1 bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded-lg text-xs font-bold active:scale-90 transition-all shadow">Use</button>
                        </div>
                    </div>
                `;
            }
        });
    }

    if (!hasItems) {
        list.innerHTML = `
            <div class="text-center text-gray-500 mt-10 p-6 bg-gray-800/50 rounded-xl border border-dashed border-gray-700">
                <span class="text-4xl opacity-50 block mb-2">🕸️</span>
                Your bag is empty.<br>Win battles & bosses to find rare items!
            </div>
        `;
    }
}

// --- USE PERMANENT STAT ENHANCER ---
function useStatXL(key) {
    if (!gameState.items || (gameState.items[key] || 0) <= 0) return;

    gameState.items[key]--;
    const item = XL_ITEM_CONFIG[key];
    let gainText = "";

    if (key === 'critXL') {
        gameState.critRate = parseFloat(((gameState.critRate || 5.0) + 0.25).toFixed(2));
        gainText = `+0.25% (${gameState.critRate}% Total)`;
    } else {
        let statKey = item.stat;
        let currentValue = gameState[statKey] || 10;
        let gain = Math.max(1, Math.floor(currentValue * 0.02));
        gameState[statKey] += gain;
        gainText = `+${gain} (${gameState[statKey]} Total)`;
    }

    syncCurrentPokemonToRoster();
    updateHub();
    renderInventory();

    showModal("✨ STAT PERMANENTLY BOOSTED!", `${gameState.name} consumed <strong class='text-yellow-400'>${item.name}</strong>!<br>Permanently gained <strong class='text-green-400'>${gainText}</strong>!`, [40, 60, 40]);
}

// --- CONSUME COOKED SUPER BERRY FROM INVENTORY ---
function useCookedSuperBerry(key) {
    if (!gameState.items || (gameState.items[key] || 0) <= 0) return;
    let dish = COOKING_RECIPES[key];
    if (!dish) return;

    gameState.items[key]--;
    let statKey = dish.stat;
    let currentValue = gameState[statKey] || 10;
    let gain = Math.max(2, Math.floor(currentValue * (dish.mult || 0.05)));
    gameState[statKey] += gain;

    syncCurrentPokemonToRoster();
    updateHub();
    renderInventory();

    showModal("🍲 SUPER BERRY CONSUMED!", `${gameState.name} enjoyed the delicious <strong class='text-yellow-400'>${dish.name}</strong>!<br>Permanently boosted <strong class='text-green-400'>+${gain} ${statKey.toUpperCase()}</strong>!`, [40, 70, 40]);
}