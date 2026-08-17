# HUMAN DIRECTIVES (CRITICAL PRIORITY: FRONT-END UI)

In the previous PRs, you successfully built the backend data structures for the Inventory and Player Stats, but **you completely forgot to build the HTML UI buttons and panels for the player to actually see and interact with them.** 

For your next iterations, you MUST implement the following Front-End features:

1. **Interactive Player Stats Panel:**
   - Make the Pokémon's name at the top of the screen clickable/tappable.
   - When the player taps the name, use JavaScript to display a modal or panel showing the detailed stats you built previously (Level, EXP, Max HP, Attack, Defense, Sp. Atk, Sp. Def, Speed). 

2. **Visible Inventory Button & Tab:**
   - Create an actual "Inventory" or "Bag" HTML button on the main screen UI.
   - When clicked, this button must open the multi-pocket Inventory UI so the player can actually see and use their items.

3. **Fix Mobile Double-Tap Zoom Bug:**
   - The game currently zooms in annoyingly when the user rapidly double-taps the "Feed" or "Battle" buttons on mobile.
   - Fix this by ensuring the viewport meta tag in `index.html` prevents scaling: `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">`
   - You MUST also add `touch-action: manipulation;` and `user-select: none;` to your CSS for all buttons and interactive containers.
