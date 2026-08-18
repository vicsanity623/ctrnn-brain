# HUMAN DIRECTIVES (CRITICAL PRIORITY: VISUAL & UI/UX POLISH OVERHAUL)

The game mechanics, RPG stats, and tests are completely stable. Your goal for this iteration is **strictly visual and aesthetic polish**. Elevate the game from a raw prototype into a modern, tactile mobile web app.

### ⚠️ STRICT SAFETY RULES (DO NOT BREAK):
1. **DO NOT REMOVE OR RENAME ANY EXISTING DOM IDs** (e.g. `hub-name`, `stat-hp`, `stat-cp`, `berry-bush`, `btn-move-vinewhip`, `enemy-hp`, etc.) — doing so will break the Jest test suite!
2. **DO NOT REMOVE ANY EXISTING JAVASCRIPT GAME LOGIC**.
3. All changes must pass `./check.sh` and `npm test`.

---

### 1. Main Hub Screen Polish (`index.html`, `style.css`)
* **Fix Awkward Button Text Wrapping:** 
  - In the bottom control bar, the "Feed ( 1 )" button currently wraps onto 3 separate lines. Fix the CSS/Flex layout so it renders cleanly (e.g. `🍓 Feed` on top and a sleek pill badge `(1)` beneath it, or clean single-line spacing).
* **Grass Ground Platform / Shadow:**
  - Bulbasaur is currently floating in an empty void. Add a soft circular ground shadow or a grassy battle pedestal (`<div class="w-48 h-10 bg-black/30 rounded-[100%] blur-sm mx-auto ...">`) underneath Bulbasaur so it feels grounded in the world.
* **Atmospheric Background:**
  - Enhance the Hub background with a subtle radial gradient or animated ambient particle glow so it feels alive rather than flat solid green.

---

### 2. Battle Screen & Combat Elevation (`index.html`, `game.js`, `style.css`)
* **Numeric HP Displays:**
  - The health bars are currently just blank green bars. Update `updateHealthBars()` and `index.html` to show the exact numbers beneath or inside the bars (e.g. `138 / 138 HP` and `85 / 85 HP`).
* **Dynamic Health Bar Colors:**
  - Make health bars change color dynamically based on remaining percentage:
    - **> 50% HP:** Green (`bg-green-500`)
    - **20% - 50% HP:** Yellow / Amber (`bg-yellow-500`)
    - **< 20% HP:** Flashing Red (`bg-red-500 animate-pulse`)
* **Combatant Shadows:**
  - Add soft elliptical ground shadows under both the Player and Enemy combat sprites.
* **Move Buttons Tactile Feel:**
  - Enhance the 4 battle move buttons with subtle elemental gradient borders, high-contrast typography, and responsive `:active:scale-95` press feedback.

---

### 3. Modals Polish (Stats & Inventory) (`index.html`, `style.css`)
* **Unit Stats Modal:**
  - Add clean icons next to each stat label for instant readability:
    - ❤️ `MAX HP`, ⚡ `SPEED`, ⚔️ `ATTACK`, 🔮 `SP. ATK`, 🛡️ `DEFENSE`, 🌀 `SP. DEF`, 💖 `MOOD`.
  - Style the **TOTAL POWER** badge with a glowing golden border (`border border-amber-400/50 bg-amber-500/10`) to make it feel prestigious.
* **Inventory Bag Modal:**
  - Polish the item cards with a subtle glassmorphic container, rounded berry icon, and an interactive "Use" button that has a glowing pulse when ready to use.

---

### 4. Micro-Interactions (`style.css`)
* Add a very subtle, gentle "idle breathing" floating animation (`@keyframes idleBob`) to the Hub Pokémon sprite so it feels alive when idling.
* Ensure all modals have smooth blur transitions (`backdrop-blur-md`).
