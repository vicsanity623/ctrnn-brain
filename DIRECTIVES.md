## Technical Requirements

### 1. Scaled Pokémon & Player Stats Profile System
Implement a detailed, zoomed profile view for Pokémon/Player units with dynamic stat growth that directly drives combat performance.

*   **In-Depth Profile UI (Zoomed View):**
    *   Provide a dedicated detailed inspection modal/screen displaying complete entity metrics: Level, EXP Bar (Current/Next Level), HP, Attack, Defense, Special Attack, Special Defense, and Speed.
    *   Display individual stat gains on the UI whenever a level-up occurs (e.g., "+3 Attack, +2 Speed").
*   **Dynamic Level-Up Stat Scaling:**
    *   Establish formulaic stat growth (e.g., scaling base stats relative to current Level using standard growth curves).
    *   Recalculate max HP, damage outputs, and turn-speed priorities programmatically whenever the unit levels up.
*   **Battle System Wiring:**
    *   Wire all live combat calculations directly to the unit's active profile stats:
        *   **Speed:** Dictates turn order in combat loops.
        *   **Attack / Sp. Atk vs. Defense / Sp. Def:** Drives physical vs. special move damage formulas.
        *   **HP Pool:** Dictates maximum combat health and fainting triggers.

### 2. Classic RPG Inventory Bag & Item Architecture
Implement a structured, multi-pocket inventory system inspired by classic RPG bags, built to handle consumables, combat items, and extensible future loot.

*   **Inventory UI & Pocket Management:**
    *   Create a tabbed/categorized UI displaying item counts, icons, and descriptions.
    *   Organize items into distinct pockets:
        *   **Berries:** Status-curing and HP/stat-restoring natural items.
        *   **Poké Balls:** Capture items (reserved for future capture mechanics).
        *   **Medicine / Consumables:** Potions, revive items, and stat boosters.
        *   **Key Items / General Loot:** Drop items, quest items, and future rewards.
*   **Extensible Item Data Engine:**
    *   Define a modular item schema (`id`, `name`, `pocketType`, `description`, `stackLimit`, `usableInBattle`, `usableInOverworld`, `effectHandler`).
    *   Ensure adding new items (e.g., Great Ball, Ultra Ball, unique berries, held items) requires only data configuration rather than code rewrites.
*   **Battle Integration:**
    *   Wire the Bag directly into the turn-based combat menu ("Items" / "Bag" option).
    *   Using an item in combat consumes the actor's turn, executes the item's `effectHandler` (e.g., healing HP via Berry/Potion), decrements stack count, and returns to the main combat loop.
