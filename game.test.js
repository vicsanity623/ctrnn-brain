// Polyfill TextEncoder/TextDecoder for JSDOM compatibility
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

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
        expect(window.gameState.speed).toBeDefined();
        expect(window.gameState.spAtk).toBeDefined();
        expect(window.gameState.enemyLevel).toBe(3);
        expect(window.gameState.gardenBerries).toBeDefined(); // Berry Bush State
    });

    test('2. Required UI Elements & Modals Exist in HTML', () => {
        // Stats Panel
        expect(document.getElementById('stats-modal')).not.toBeNull();
        expect(document.getElementById('stat-hp')).not.toBeNull();
        expect(document.getElementById('stat-cp')).not.toBeNull();
        expect(document.getElementById('stat-spd')).not.toBeNull();
        
        // Inventory Bag
        expect(document.getElementById('inventory-modal')).not.toBeNull();
        expect(document.getElementById('inventory-list')).not.toBeNull();
        
        // Berry Bush & Hub
        expect(document.getElementById('berry-bush')).not.toBeNull();
        expect(document.getElementById('hub-name')).not.toBeNull();
        expect(document.getElementById('player-hp')).not.toBeNull();

        // 4-Move Battle Grid & Elemental Type Badge
        expect(document.getElementById('btn-move-tackle')).not.toBeNull();
        expect(document.getElementById('btn-move-growl')).not.toBeNull();
        expect(document.getElementById('btn-move-vinewhip')).not.toBeNull();
        expect(document.getElementById('btn-move-special')).not.toBeNull();
        expect(document.getElementById('enemy-type-badge')).not.toBeNull();
    });

    test('3. Logic Check: feedBerry() consumes berry and adds mood at < 10 hearts', () => {
        window.gameState.berries = 5;
        window.gameState.hearts = 2;
        
        window.feedBerry();
        
        expect(window.gameState.berries).toBe(4);
        expect(window.gameState.hearts).toBe(3);
    });

    test('4. Logic Check: Level Up scales stats correctly', () => {
        const initialLevel = window.gameState.level;
        const initialAtk = window.gameState.attack;
        
        window.gameState.hearts = 10;
        window.levelUp(0);
        
        expect(window.gameState.level).toBe(initialLevel + 1);
        expect(window.gameState.attack).toBeGreaterThan(initialAtk);
    });

    test('5. Logic Check: Player Attack uses stats (No instant win bug)', () => {
        window.pHp = 50;
        window.eHp = 100;
        window.gameState.attack = 10;
        window.gameState.hearts = 10;

        window.playerAttack('tackle');

        // Enemy should only take 10 damage
        expect(window.eHp).toBe(90); 
    });

    test('6. Logic Check: Winning a battle increases enemyLevel (Stage Progression)', () => {
        window.gameState.enemyLevel = 3;
        
        // Simulate a loss
        window.endBattle(false);
        expect(window.gameState.enemyLevel).toBe(3);

        // Simulate a win
        window.endBattle(true);
        expect(window.gameState.enemyLevel).toBe(4);
    });

    test('7. Logic Check: Full 10/10 Hearts feeding grants 5% Max XP Treat Bonus', () => {
        window.gameState.berries = 5;
        window.gameState.hearts = 10;
        window.gameState.xp = 0;
        window.gameState.maxXp = 100;

        window.feedBerry();

        expect(window.gameState.berries).toBe(4);
        expect(window.gameState.xp).toBe(5); // 5% of 100 = 5 XP bonus!
    });

    test('8. Logic Check: harvestBush() transfers garden berries to inventory', () => {
        window.gameState.berries = 2;
        window.gameState.gardenBerries = 3;

        window.harvestBush();

        expect(window.gameState.berries).toBe(5);
        expect(window.gameState.gardenBerries).toBe(0);
    });

    test('9. Logic Check: Elemental Type Advantages calculate accurately', () => {
        // Grass vs Water = 2.0x Super Effective
        window.enemyType = 'water';
        expect(window.getTypeMultiplier('vinewhip')).toBe(2.0);

        // Grass vs Fire = 0.5x Not Very Effective
        window.enemyType = 'fire';
        expect(window.getTypeMultiplier('vinewhip')).toBe(0.5);

        // Normal moves are always 1.0x neutral
        expect(window.getTypeMultiplier('tackle')).toBe(1.0);
    });
});