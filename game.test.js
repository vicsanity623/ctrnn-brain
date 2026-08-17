const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Load actual files from the repository
const html = fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf8');
const js = fs.readFileSync(path.resolve(__dirname, './game.js'), 'utf8');

describe('Strict Game Logic & UI Verification', () => {
    let window, document;

    beforeEach(() => {
        // Create a fresh headless browser for every single test
        const dom = new JSDOM(html, { runScripts: 'dangerously' });
        window = dom.window;
        document = window.document;

        // Inject game.js into this headless browser
        const script = document.createElement('script');
        script.textContent = js;
        document.body.appendChild(script);
    });

    test('1. Core Game State Initializes Correctly', () => {
        expect(window.gameState).toBeDefined();
        expect(window.gameState.level).toBe(5);
        expect(window.gameState.attack).toBeDefined();
        expect(window.gameState.maxHp).toBeDefined();
    });

    test('2. Required UI Elements & Modals Exist in HTML', () => {
        // Stats Panel
        expect(document.getElementById('stats-modal')).not.toBeNull();
        expect(document.getElementById('stat-hp')).not.toBeNull();
        
        // Inventory Bag
        expect(document.getElementById('inventory-modal')).not.toBeNull();
        expect(document.getElementById('inventory-list')).not.toBeNull();
        
        // Battle & Hub Elements
        expect(document.getElementById('hub-name')).not.toBeNull();
        expect(document.getElementById('player-hp')).not.toBeNull();
    });

    test('3. Logic Check: feedBerry() consumes berry and adds mood', () => {
        window.gameState.berries = 5;
        window.gameState.hearts = 2;
        
        window.feedBerry();
        
        expect(window.gameState.berries).toBe(4); // Berry should go down
        expect(window.gameState.hearts).toBe(3);  // Mood should go up
    });

    test('4. Logic Check: Level Up scales stats correctly', () => {
        const initialLevel = window.gameState.level;
        const initialAtk = window.gameState.attack;
        
        window.gameState.hearts = 10; // Max mood for best scaling
        window.levelUp(0); // Trigger level up manually
        
        expect(window.gameState.level).toBe(initialLevel + 1);
        expect(window.gameState.attack).toBeGreaterThan(initialAtk); // Attack must increase
    });

    test('5. Logic Check: Player Attack uses stats (No instant win bug)', () => {
        window.pHp = 50;
        window.eHp = 100;
        window.gameState.attack = 10;
        window.gameState.hearts = 10; // Even with max mood...

        window.playerAttack();

        // Enemy should only take 10 damage, proving the 999 1-hit KO bug is gone!
        expect(window.eHp).toBe(90); 
    });
});
