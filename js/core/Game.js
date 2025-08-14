import { EventEmitter } from './EventEmitter.js';
import { Scene } from './Scene.js';
import { GameConfig } from '../config/GameConfig.js';
import { AssetManager } from '../managers/AssetManager.js';
import { GameStateManager } from '../managers/GameStateManager.js';
import { AnimationSystem } from '../systems/AnimationSystem.js';
import { InputSystem } from '../systems/InputSystem.js';
import { UIController } from '../ui/UIController.js';
import { Garden } from '../entities/Garden.js';
import { ItemFactory } from '../entities/items/ItemFactory.js';

export class Game extends EventEmitter {
    constructor() {
        super();
        this.isRunning = false;
        this.isInitialized = false;
        
        this.scene = null;
        this.assetManager = null;
        this.stateManager = null;
        this.animationSystem = null;
        this.inputSystem = null;
        this.uiController = null;
        this.garden = null;
        this.itemFactory = null;
        
        this.init();
    }

    async init() {
        try {
            this.initializeManagers();
            this.initializeSystems();
            this.initializeScene();
            this.initializeUI();
            
            this.showLoadingScreen();
            this.setupEventListeners();
            
            await this.preloadAssets();
            
            this.start();
            this.hideLoadingScreen();
            this.showTutorial();
            
            this.isInitialized = true;
            this.emit('game:initialized');
            
        } catch (error) {
            console.error('Game initialization failed:', error);
            this.emit('game:error', error);
        }
    }

    initializeManagers() {
        this.assetManager = new AssetManager();
        this.stateManager = new GameStateManager();
        this.animationSystem = new AnimationSystem();
    }

    initializeSystems() {
        this.scene = new Scene();
        this.inputSystem = new InputSystem(this.scene.getRenderer());
        this.uiController = new UIController();
    }

    initializeScene() {
        this.garden = new Garden(this.assetManager);
        this.itemFactory = new ItemFactory(this.assetManager);
        
        this.garden.getObjects().forEach(obj => {
            this.scene.add(obj);
        });
    }

    initializeUI() {
        this.uiController.on('tool:selected', (toolData) => {
            this.stateManager.setSelectedTool(toolData);
        });

        this.uiController.on('daynight:toggle', () => {
            this.toggleDayNight();
        });

        this.uiController.on('garden:clear', () => {
            this.clearGarden();
        });

        this.uiController.on('window:resize', () => {
            this.handleWindowResize();
        });
    }

    setupEventListeners() {
        this.inputSystem.on('click', (data) => {
            this.handleSceneClick(data);
        });

        this.stateManager.on('item:added', (item) => {
            this.handleItemAdded(item);
        });

        this.stateManager.on('items:cleared', () => {
            this.handleItemsCleared();
        });

        this.stateManager.on('state:selectedTool:changed', (newTool) => {
            this.emit('tool:changed', newTool);
        });

        this.scene.on('daynight:toggled', (isNightMode) => {
            this.handleDayNightToggle(isNightMode);
        });
    }

    async preloadAssets() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, GameConfig.UI.LOADING_DURATION);
        });
    }

    handleSceneClick(clickData) {
        const selectedTool = this.stateManager.getSelectedTool();
        
        if (!selectedTool) {
            this.uiController.showNotification('Please select a tool first!', 'warning');
            return;
        }

        const intersects = this.inputSystem.raycast(
            this.scene.getCamera(),
            [this.garden.getGroundPlane()]
        );

        if (intersects.length > 0) {
            const position = intersects[0].point;
            
            if (this.garden.isWithinBounds(position)) {
                this.placeItem(selectedTool, position);
            } else {
                this.uiController.showNotification('Please place items within the garden area!', 'warning');
            }
        }
    }

    placeItem(toolData, position) {
        try {
            const item = this.itemFactory.createItem(toolData.type, toolData.item, position);
            
            item.setScale(0.1);
            this.scene.add(item.getMesh());
            
            this.animationSystem.animateScale(item.getMesh(), 1, {
                duration: GameConfig.ITEMS.SCALE_ANIMATION.duration,
                easing: 'easeOutBack'
            });
            
            this.animationSystem.animateRotation(item.getMesh(), 1, {
                duration: GameConfig.ITEMS.SCALE_ANIMATION.duration
            });
            
            this.stateManager.addItem(item);
            this.emit('item:placed', item);
            
        } catch (error) {
            console.error('Failed to place item:', error);
            this.uiController.showNotification('Failed to place item', 'error');
        }
    }

    handleItemAdded(item) {
        if (item.type === 'lamp') {
            this.updateLampLighting(item, this.stateManager.getStateProperty('isNightMode'));
        }
    }

    handleItemsCleared() {
        this.stateManager.getPlacedItems().forEach(item => {
            this.scene.remove(item.getMesh());
            item.dispose();
        });
        
        this.uiController.clearSelectedTool();
        this.uiController.showNotification('Garden cleared!', 'success');
    }

    toggleDayNight() {
        const isNightMode = this.scene.toggleDayNight();
        this.stateManager.setState({ isNightMode });
        this.uiController.updateDayNightButton(isNightMode);
        
        this.stateManager.getPlacedItems().forEach(item => {
            if (item.toggleNightMode) {
                item.toggleNightMode(isNightMode);
            }
        });
    }

    handleDayNightToggle(isNightMode) {
        this.uiController.updateDayNightButton(isNightMode);
    }

    updateLampLighting(item, isNightMode) {
        if (item.toggleNightMode) {
            item.toggleNightMode(isNightMode);
        }
    }

    clearGarden() {
        this.stateManager.clearAllItems();
    }

    handleWindowResize() {
        this.scene.resize();
    }

    showLoadingScreen() {
        this.stateManager.setLoading(true);
        this.uiController.showLoading();
    }

    hideLoadingScreen() {
        this.stateManager.setLoading(false);
        this.uiController.hideLoading();
    }

    showTutorial() {
        this.uiController.showTutorial();
        setTimeout(() => {
            this.hideTutorial();
        }, GameConfig.UI.TUTORIAL_DURATION);
    }

    hideTutorial() {
        this.stateManager.setTutorialVisible(false);
        this.uiController.hideTutorial();
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.gameLoop();
        this.emit('game:started');
    }

    pause() {
        this.isRunning = false;
        this.emit('game:paused');
    }

    resume() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.gameLoop();
            this.emit('game:resumed');
        }
    }

    gameLoop() {
        if (!this.isRunning) return;
        
        requestAnimationFrame(() => this.gameLoop());
        
        this.update();
        this.render();
    }

    update() {
        this.animationSystem.update();
        
        this.stateManager.getPlacedItems().forEach(item => {
            if (item.update) {
                item.update();
            }
        });
    }

    render() {
        this.scene.render();
    }

    dispose() {
        this.pause();
        
        if (this.assetManager) this.assetManager.dispose();
        if (this.animationSystem) this.animationSystem.clear();
        if (this.inputSystem) this.inputSystem.dispose();
        if (this.uiController) this.uiController.dispose();
        if (this.garden) this.garden.dispose();
        
        this.stateManager.getPlacedItems().forEach(item => {
            item.dispose();
        });
        
        this.emit('game:disposed');
    }

    getState() {
        return this.stateManager.getState();
    }

    exportSave() {
        return this.stateManager.exportState();
    }

    importSave(saveData) {
        this.stateManager.importState(saveData);
    }
}