import { BaseItem } from './BaseItem.js';

export class FurnitureItem extends BaseItem {
    constructor(assetManager, subType) {
        super(assetManager, subType);
        this.create();
        this.enableShadows();
    }

    create() {
        switch (this.type) {
            case 'bench':
                this.createBench();
                break;
            case 'table':
                this.createTable();
                break;
            case 'fountain':
                this.createFountain();
                break;
            default:
                this.createBench();
        }
    }

    createBench() {
        const woodMaterial = this.assetManager.getMaterial('lambert', 0x8B4513);

        const seatGeometry = this.assetManager.getGeometry('box', 1.2, 0.1, 0.4);
        const seat = new THREE.Mesh(seatGeometry, woodMaterial);
        seat.position.y = 0.4;
        this.group.add(seat);

        const backGeometry = this.assetManager.getGeometry('box', 1.2, 0.6, 0.1);
        const back = new THREE.Mesh(backGeometry, woodMaterial);
        back.position.set(0, 0.7, -0.15);
        this.group.add(back);

        const legPositions = [
            [-0.5, 0.2, -0.15],
            [0.5, 0.2, -0.15],
            [-0.5, 0.2, 0.15],
            [0.5, 0.2, 0.15]
        ];

        legPositions.forEach(pos => {
            const legGeometry = this.assetManager.getGeometry('cylinder', 0.03, 0.03, 0.4);
            const leg = new THREE.Mesh(legGeometry, woodMaterial);
            leg.position.set(...pos);
            this.group.add(leg);
        });

        for (let i = 0; i < 5; i++) {
            const slat = new THREE.Mesh(
                this.assetManager.getGeometry('box', 1.1, 0.08, 0.03),
                woodMaterial
            );
            slat.position.set(0, 0.4 + i * 0.08, -0.12);
            this.group.add(slat);
        }
    }

    createTable() {
        const woodMaterial = this.assetManager.getMaterial('lambert', 0x8B4513);

        const topGeometry = this.assetManager.getGeometry('cylinder', 0.6, 0.6, 0.05);
        const top = new THREE.Mesh(topGeometry, woodMaterial);
        top.position.y = 0.7;
        this.group.add(top);

        const legGeometry = this.assetManager.getGeometry('cylinder', 0.03, 0.03, 0.7);
        const leg = new THREE.Mesh(legGeometry, woodMaterial);
        leg.position.y = 0.35;
        this.group.add(leg);

        const supportRingGeometry = this.assetManager.getGeometry('ring', 0.25, 0.3, 16);
        const supportRing = new THREE.Mesh(supportRingGeometry, woodMaterial);
        supportRing.position.y = 0.2;
        supportRing.rotation.x = Math.PI / 2;
        this.group.add(supportRing);
    }

    createFountain() {
        const stoneMaterial = this.assetManager.getMaterial('lambert', 0x708090);
        const waterMaterial = this.assetManager.getMaterial('lambert', 0x4682B4, { 
            transparent: true, 
            opacity: 0.7 
        });

        const baseGeometry = this.assetManager.getGeometry('cylinder', 0.8, 0.8, 0.2);
        const base = new THREE.Mesh(baseGeometry, stoneMaterial);
        base.position.y = 0.1;
        this.group.add(base);

        const waterGeometry = this.assetManager.getGeometry('cylinder', 0.75, 0.75, 0.05);
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.position.y = 0.22;
        this.group.add(water);

        const centerPoleGeometry = this.assetManager.getGeometry('cylinder', 0.1, 0.1, 0.8);
        const centerPole = new THREE.Mesh(centerPoleGeometry, stoneMaterial);
        centerPole.position.y = 0.5;
        this.group.add(centerPole);

        const topGeometry = this.assetManager.getGeometry('sphere', 0.15);
        const top = new THREE.Mesh(topGeometry, waterMaterial);
        top.position.y = 0.9;
        this.group.add(top);

        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const droplet = new THREE.Mesh(
                this.assetManager.getGeometry('sphere', 0.02),
                waterMaterial
            );
            droplet.position.set(
                Math.cos(angle) * 0.3,
                0.4 + Math.random() * 0.3,
                Math.sin(angle) * 0.3
            );
            this.group.add(droplet);
        }
    }
}