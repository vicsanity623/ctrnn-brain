# HUMAN DIRECTIVES (CRITICAL PRIORITY: BATTLE PROGRESSION)

Currently, wild enemy Pokémon scale dynamically based on the player's level. We need to change this to an independent "Stage Progression" system where enemies only get harder when the player actually wins.

Please update `game.js` and `game.test.js` to implement the following:

### 1. Independent Enemy Level State
- Add a new property to the `gameState` object called `enemyLevel` and initialize it to `3`.
- In the `startGame()` function, add backward compatibility for old saves: `if (gameState.enemyLevel === undefined) gameState.enemyLevel = 3;`

### 2. Update Battle Initialization
- In `enterBattle()`, completely remove the math that calculates the wild Pokémon's level based on the player's level.
- The wild Pokémon's level MUST now equal `gameState.enemyLevel`. 
- Continue to scale the enemy's Max HP and Attack damage based on this new `gameState.enemyLevel` property.

### 3. Progressive Difficulty (Win Streak)
- Inside the `endBattle(won)` function, if the player wins (`won === true`), increment `gameState.enemyLevel` by 1.
- If the player loses, do NOT increment `gameState.enemyLevel`. This forces the player to grind hearts/berries to get stronger before they can pass this specific stage.
- Call `updateHub()` at the end of the battle to ensure the new `enemyLevel` is saved to `localStorage`.

### 4. UPDATE THE JEST TESTS
- You MUST update `game.test.js` to expect this new behavior. 
- Write or update tests to prove that `gameState.enemyLevel` starts at 3, increases by 1 when `endBattle(true)` is called, and remains unchanged when `endBattle(false)` is called.
