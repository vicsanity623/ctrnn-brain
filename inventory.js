// ============================================================================
// INVENTORY & BAG SYSTEM (inventory.js)
// ============================================================================

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

    // 3. Render Rare XL Stat Enhancers
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