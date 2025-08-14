import { Game } from './core/Game.js';

class GardenMakeoverApp {
    constructor() {
        this.game = null;
        this.init();
    }

    async init() {
        try {
            await this.waitForDOM();
            this.game = new Game();
            this.setupGameEventListeners();
            
        } catch (error) {
            console.error('Application initialization failed:', error);
            this.showError('Failed to initialize game. Please refresh the page.');
        }
    }

    waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }

    setupGameEventListeners() {
        this.game.on('game:initialized', () => {
            console.log('GardenMakeover initialized successfully');
        });

        this.game.on('game:error', (error) => {
            console.error('Game error:', error);
            this.showError('An error occurred. Please refresh the page.');
        });

        this.game.on('item:placed', (item) => {
            console.log('Item placed:', item.type);
        });

        this.game.on('tool:changed', (tool) => {
            console.log('Tool selected:', tool);
        });
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(231, 76, 60, 0.9);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            z-index: 10000;
            font-family: Arial, sans-serif;
        `;
        errorDiv.innerHTML = `
            <h3>🚫 Error</h3>
            <p>${message}</p>
            <button onclick="location.reload()" style="
                background: white;
                color: #e74c3c;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                margin-top: 10px;
                cursor: pointer;
                font-weight: bold;
            ">Refresh Page</button>
        `;
        document.body.appendChild(errorDiv);
    }

    dispose() {
        if (this.game) {
            this.game.dispose();
        }
    }
}

window.addEventListener('beforeunload', () => {
    if (window.gardenApp) {
        window.gardenApp.dispose();
    }
});

window.gardenApp = new GardenMakeoverApp();