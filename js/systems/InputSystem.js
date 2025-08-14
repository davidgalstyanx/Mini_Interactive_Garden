import { EventEmitter } from '../core/EventEmitter.js';

export class InputSystem extends EventEmitter {
    constructor(renderer) {
        super();
        this.renderer = renderer;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.isEnabled = true;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.renderer.domElement.addEventListener('click', (event) => {
            if (!this.isEnabled) return;
            this.handleClick(event);
        });

        this.renderer.domElement.addEventListener('mousemove', (event) => {
            if (!this.isEnabled) return;
            this.handleMouseMove(event);
        });

        window.addEventListener('resize', () => {
            this.emit('window:resize');
        });
    }

    handleClick(event) {
        this.updateMousePosition(event);
        this.emit('click', {
            mouse: { x: this.mouse.x, y: this.mouse.y },
            originalEvent: event
        });
    }

    handleMouseMove(event) {
        this.updateMousePosition(event);
        this.emit('mousemove', {
            mouse: { x: this.mouse.x, y: this.mouse.y },
            originalEvent: event
        });
    }

    updateMousePosition(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    raycast(camera, objects) {
        this.raycaster.setFromCamera(this.mouse, camera);
        return this.raycaster.intersectObjects(objects);
    }

    enable() {
        this.isEnabled = true;
    }

    disable() {
        this.isEnabled = false;
    }

    dispose() {
        this.renderer.domElement.removeEventListener('click', this.handleClick);
        this.renderer.domElement.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('resize', this.handleResize);
    }
}