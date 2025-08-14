import { EventEmitter } from '../core/EventEmitter.js';
import { GameConfig } from '../config/GameConfig.js';

export class UIController extends EventEmitter {
    constructor() {
        super();
        this.elements = {};
        this.isInitialized = false;
        
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        this.elements = {
            loading: document.getElementById('loading'),
            tutorial: document.getElementById('tutorial'),
            toolPanel: document.getElementById('toolPanel'),
            dayNightToggle: document.getElementById('dayNightToggle'),
            clearGarden: document.getElementById('clearGarden'),
            itemButtons: document.querySelectorAll('.item-btn')
        };
        
        this.validateElements();
        this.isInitialized = true;
    }

    validateElements() {
        Object.entries(this.elements).forEach(([key, element]) => {
            if (!element && key !== 'itemButtons') {
                console.warn(`UI element '${key}' not found`);
            }
        });
    }

    setupEventListeners() {
        this.setupToolSelection();
        this.setupControlButtons();
        this.setupWindowEvents();
    }

    setupToolSelection() {
        this.elements.itemButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                this.handleToolSelection(button, event);
            });
        });
    }

    setupControlButtons() {
        if (this.elements.dayNightToggle) {
            this.elements.dayNightToggle.addEventListener('click', () => {
                this.emit('daynight:toggle');
            });
        }

        if (this.elements.clearGarden) {
            this.elements.clearGarden.addEventListener('click', () => {
                this.showConfirmDialog('Clear Garden', 'Are you sure you want to clear all items?')
                    .then(confirmed => {
                        if (confirmed) {
                            this.emit('garden:clear');
                        }
                    });
            });
        }
    }

    setupWindowEvents() {
        window.addEventListener('resize', () => {
            this.handleWindowResize();
        });
    }

    handleToolSelection(button, event) {
        event.preventDefault();
        
        this.clearActiveButtons();
        button.classList.add('active');
        
        const toolData = {
            type: button.dataset.type,
            item: button.dataset.item,
            element: button
        };
        
        this.emit('tool:selected', toolData);
    }

    clearActiveButtons() {
        this.elements.itemButtons.forEach(btn => {
            btn.classList.remove('active');
        });
    }

    clearSelectedTool() {
        this.clearActiveButtons();
        this.emit('tool:cleared');
    }

    updateDayNightButton(isNightMode) {
        if (!this.elements.dayNightToggle) return;
        
        if (isNightMode) {
            this.elements.dayNightToggle.textContent = '☀️ Day Mode';
            this.elements.dayNightToggle.classList.add('active');
        } else {
            this.elements.dayNightToggle.textContent = '🌙 Night Mode';
            this.elements.dayNightToggle.classList.remove('active');
        }
    }

    showLoading() {
        if (this.elements.loading) {
            this.elements.loading.style.display = 'block';
        }
    }

    hideLoading() {
        if (this.elements.loading) {
            this.elements.loading.style.display = 'none';
        }
    }

    showTutorial() {
        if (this.elements.tutorial) {
            this.elements.tutorial.classList.remove('hidden');
            this.elements.tutorial.style.display = 'block';
        }
    }

    hideTutorial() {
        if (this.elements.tutorial) {
            this.elements.tutorial.classList.add('hidden');
            setTimeout(() => {
                if (this.elements.tutorial) {
                    this.elements.tutorial.style.display = 'none';
                }
            }, 500);
        }
    }

    showNotification(message, type = 'info', duration = 3000) {
        const notification = this.createNotificationElement(message, type);
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, duration);
    }

    createNotificationElement(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            zIndex: '1000',
            opacity: '0',
            transform: 'translateX(100%)',
            transition: 'all 0.3s ease'
        });
        
        const colors = {
            info: '#3498db',
            success: '#2ecc71',
            warning: '#f39c12',
            error: '#e74c3c'
        };
        
        notification.style.backgroundColor = colors[type] || colors.info;
        
        return notification;
    }

    showConfirmDialog(title, message) {
        return new Promise((resolve) => {
            const result = confirm(`${title}\n\n${message}`);
            resolve(result);
        });
    }

    handleWindowResize() {
        this.emit('window:resize');
    }

    setToolPanelVisible(visible) {
        if (this.elements.toolPanel) {
            this.elements.toolPanel.style.display = visible ? 'block' : 'none';
        }
    }

    getElement(elementName) {
        return this.elements[elementName];
    }

    isElementVisible(elementName) {
        const element = this.elements[elementName];
        if (!element) return false;
        
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && style.visibility !== 'hidden';
    }

    dispose() {
        Object.values(this.elements).forEach(element => {
            if (element && element.removeEventListener) {
                element.removeEventListener('click', () => {});
            }
        });
        
        window.removeEventListener('resize', this.handleWindowResize);
        this.elements = {};
        this.isInitialized = false;
    }
}