import { GameConfig } from '../config/GameConfig.js';
import { AssetManager } from '../managers/AssetManager.js';

export class Garden {
    constructor(assetManager) {
        this.assetManager = assetManager;
        this.groundPlane = null;
        this.border = null;
        
        this.createGround();
        this.createBorder();
    }

    createGround() {
        const config = GameConfig.GARDEN;
        const grassTexture = this.assetManager.createGrassTexture();
        
        const groundGeometry = this.assetManager.getGeometry('plane', config.SIZE, config.SIZE);
        const groundMaterial = this.assetManager.getMaterial('lambert', config.GROUND_COLOR, {
            map: grassTexture
        });

        this.groundPlane = new THREE.Mesh(groundGeometry, groundMaterial);
        this.groundPlane.rotation.x = -Math.PI / 2;
        this.groundPlane.receiveShadow = true;
        this.groundPlane.userData = { type: 'ground' };
    }

    createBorder() {
        const config = GameConfig.GARDEN;
        const borderGeometry = this.assetManager.getGeometry('ring', config.SIZE / 2, config.SIZE / 2 + 0.2, 32);
        const borderMaterial = this.assetManager.getMaterial('lambert', config.BORDER_COLOR);
        
        this.border = new THREE.Mesh(borderGeometry, borderMaterial);
        this.border.rotation.x = -Math.PI / 2;
        this.border.position.y = 0.01;
        this.border.userData = { type: 'border' };
    }

    getObjects() {
        return [this.groundPlane, this.border].filter(obj => obj !== null);
    }

    getGroundPlane() {
        return this.groundPlane;
    }

    isWithinBounds(position) {
        const boundary = GameConfig.GARDEN.BOUNDARY;
        return position.x >= -boundary && 
               position.x <= boundary && 
               position.z >= -boundary && 
               position.z <= boundary;
    }

    dispose() {
        if (this.groundPlane) {
            this.groundPlane.geometry.dispose();
            this.groundPlane.material.dispose();
        }
        if (this.border) {
            this.border.geometry.dispose();
            this.border.material.dispose();
        }
    }
}