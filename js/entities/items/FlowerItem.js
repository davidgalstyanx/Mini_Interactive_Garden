import { BaseItem } from './BaseItem.js';

export class FlowerItem extends BaseItem {
    constructor(assetManager, subType) {
        super(assetManager, subType);
        this.create();
        this.enableShadows();
    }

    create() {
        const flowerColor = this.getFlowerColor();
        this.createStem();
        this.createFlowerHead(flowerColor);
        this.createPetals(flowerColor);
        
        if (this.type === 'tulip') {
            this.createTulipGroup();
        }
    }

    getFlowerColor() {
        const colors = {
            rose: 0xFF1493,
            tulip: 0xFF69B4,
            sunflower: 0xFFD700,
            lily: 0xFFFFFF
        };
        return colors[this.type] || 0xFF69B4;
    }

    createStem() {
        const stemGeometry = this.assetManager.getGeometry('cylinder', 0.02, 0.02, 0.5);
        const stemMaterial = this.assetManager.getMaterial('lambert', 0x228B22);
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = 0.25;
        this.group.add(stem);

        for (let i = 0; i < 2; i++) {
            const leafGeometry = this.assetManager.getGeometry('sphere', 0.08, 8, 4);
            const leafMaterial = this.assetManager.getMaterial('lambert', 0x32CD32);
            const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
            leaf.position.set(
                (i === 0 ? -0.1 : 0.1),
                0.15 + i * 0.1,
                0
            );
            leaf.scale.set(2, 0.5, 0.5);
            this.group.add(leaf);
        }
    }

    createFlowerHead(color) {
        const flowerGeometry = this.assetManager.getGeometry('sphere', 0.15);
        const flowerMaterial = this.assetManager.getMaterial('lambert', color);
        const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
        flower.position.y = 0.5;
        this.group.add(flower);

        const centerGeometry = this.assetManager.getGeometry('sphere', 0.05);
        const centerMaterial = this.assetManager.getMaterial('lambert', 0xFFFF00);
        const center = new THREE.Mesh(centerGeometry, centerMaterial);
        center.position.y = 0.52;
        this.group.add(center);
    }

    createPetals(color) {
        const petalCount = this.type === 'rose' ? 8 : 6;
        const petalMaterial = this.assetManager.getMaterial('lambert', color);
        
        for (let i = 0; i < petalCount; i++) {
            const petalGeometry = this.assetManager.getGeometry('sphere', 0.08);
            const petal = new THREE.Mesh(petalGeometry, petalMaterial);
            const angle = (i / petalCount) * Math.PI * 2;
            const radius = 0.15;
            
            petal.position.set(
                Math.cos(angle) * radius,
                0.5,
                Math.sin(angle) * radius
            );
            petal.scale.set(0.7, 0.5, 1.2);
            this.group.add(petal);
        }
    }

    createTulipGroup() {
        for (let i = 0; i < 2; i++) {
            const extraTulip = this.group.clone();
            extraTulip.position.set(
                (Math.random() - 0.5) * 0.3,
                0,
                (Math.random() - 0.5) * 0.3
            );
            extraTulip.scale.set(0.8, 0.9, 0.8);
            this.group.add(extraTulip);
        }
    }
}