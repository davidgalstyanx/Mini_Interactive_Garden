import { EventEmitter } from '../core/EventEmitter.js';

export class GameStateManager extends EventEmitter {
    constructor() {
        super();
        this.state = {
            selectedTool: null,
            placedItems: [],
            isNightMode: false,
            isLoading: true,
            tutorialVisible: true
        };
        
        this.history = [];
        this.maxHistorySize = 50;
    }

    setState(newState) {
        const previousState = { ...this.state };
        this.state = { ...this.state, ...newState };
        
        this.addToHistory(previousState);
        this.emit('state:changed', this.state, previousState);
        
        Object.keys(newState).forEach(key => {
            this.emit(`state:${key}:changed`, newState[key], previousState[key]);
        });
    }

    getState() {
        return { ...this.state };
    }

    getStateProperty(property) {
        return this.state[property];
    }

    setSelectedTool(tool) {
        this.setState({ selectedTool: tool });
    }

    getSelectedTool() {
        return this.state.selectedTool;
    }

    addItem(item) {
        const newItems = [...this.state.placedItems, item];
        this.setState({ placedItems: newItems });
        this.emit('item:added', item);
    }

    removeItem(itemId) {
        const newItems = this.state.placedItems.filter(item => item.id !== itemId);
        const removedItem = this.state.placedItems.find(item => item.id === itemId);
        this.setState({ placedItems: newItems });
        this.emit('item:removed', removedItem);
    }

    clearAllItems() {
        const previousItems = [...this.state.placedItems];
        this.setState({ placedItems: [] });
        this.emit('items:cleared', previousItems);
    }

    getPlacedItems() {
        return [...this.state.placedItems];
    }

    toggleDayNight() {
        const newMode = !this.state.isNightMode;
        this.setState({ isNightMode: newMode });
        this.emit('daynight:toggled', newMode);
        return newMode;
    }

    setLoading(isLoading) {
        this.setState({ isLoading });
    }

    setTutorialVisible(visible) {
        this.setState({ tutorialVisible: visible });
    }

    addToHistory(state) {
        this.history.push(state);
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
    }

    canUndo() {
        return this.history.length > 0;
    }

    undo() {
        if (!this.canUndo()) return false;
        
        const previousState = this.history.pop();
        this.state = previousState;
        this.emit('state:restored', this.state);
        return true;
    }

    exportState() {
        return {
            version: '1.0.0',
            timestamp: Date.now(),
            state: this.getState()
        };
    }

    importState(exportedData) {
        if (!exportedData || !exportedData.state) {
            throw new Error('Invalid state data');
        }
        
        this.setState(exportedData.state);
        this.emit('state:imported', exportedData);
    }

    reset() {
        const initialState = {
            selectedTool: null,
            placedItems: [],
            isNightMode: false,
            isLoading: false,
            tutorialVisible: true
        };
        
        this.state = initialState;
        this.history = [];
        this.emit('state:reset', initialState);
    }
}