# HUMAN DIRECTIVES (CRITICAL PRIORITY: COMBAT OVERHAUL)

The current battle system is too basic. Players can spam the "Tackle" button to win instantly, enemies don't scale, and the UI lacks crucial battle information. 

For your next iterations, you MUST overhaul the battle system by implementing the following features in `game.js`, `index.html`, and updating `game.test.js`:

### 1. Strict Turn-Based Combat (Anti-Spam)
- When the player clicks an attack (e.g., Tackle), instantly **disable all attack buttons** so they cannot be spammed.
- Execute the player's attack, then trigger a `setTimeout` (e.g., 1000ms) for the Enemy's turn.
- After the Enemy attacks, **re-enable the attack buttons** for the player's next turn.

### 2. Dynamic Enemy Scaling & Levels
- When a battle starts, calculate a dynamic level for the Wild Pokémon based on the player's level (e.g., `enemyLevel = Math.max(1, gameState.level + Math.floor(Math.random() * 3) - 1)`).
- Scale the enemy's Max HP and Attack damage based on this new `enemyLevel`.
- **UI Update:** Update the battle screen nameplates to display the levels. (e.g., `Wild Grimer (Lv. 5)` and `Bulbasaur (Lv. 6)`).

### 3. Battle Log / Narration Text
- Add a text container `<div>` inside the battle screen UI (perhaps above the attack buttons).
- Update this text during turns (e.g., "Bulbasaur used Tackle!", "Wild Grimer hit you for 12 damage!", "Wild Grimer fainted!").

### 4. Meaningful Moves
- "Tackle" should deal standard damage based on the `gameState.attack` stat.
- Make "Growl" actually do something strategic. For example, it deals 0 damage but reduces the enemy's attack power for the rest of the battle, or it heals the player slightly.

### 5. UPDATE THE JEST TESTS
- Because you are changing how `playerAttack()` works (it might now require async/timeouts or handle enemy turns differently), you **MUST** update `game.test.js`.
- If you don't update the tests to reflect the new turn-based logic and enemy scaling, the `check.sh` validation suite will fail, and your PR will be rejected.
