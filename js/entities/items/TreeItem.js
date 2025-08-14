import { BaseItem } from './BaseItem.js';

export class TreeItem extends BaseItem {
    constructor(assetManager, subType) {
        super(assetManager, subType);
        this.create();
        this.enableShadows();
    }

    create() {
        switch (this.type) {
            case 'oak':
                this.createOakTree();
                break;
            case 'pine':
                this.createPineTree();
                break;
            default:
                this.createOakTree();
        }
    }

    createOakTree() {
        const trunkHeight = 0.8;
        const trunkRadius = 0.1;
        const leavesRadius = 0.8;

        const trunkGeometry = this.assetManager.getGeometry('cylinder', trunkRadius, trunkRadius * 1.5, trunkHeight);
        const trunkMaterial = this.assetManager.getMaterial('lambert', 0x8B4513);
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = trunkHeight / 2;
        this.group.add(trunk);

        const leavesGeometry = this.assetManager.getGeometry('sphere', leavesRadius);
        const leavesMaterial = this.assetManager.getMaterial('lambert', 0x228B22);
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = trunkHeight + leavesRadius * 0.6;
        this.group.add(leaves);

        for (let i = 0; i < 5; i++) {
            const smallLeafGeometry = this.assetManager.getGeometry('sphere', leavesRadius * 0.3);
            const smallLeaf = new THREE.Mesh(smallLeafGeometry, leavesMaterial);
            const angle = (i / 5) * Math.PI * 2;
            const distance = leavesRadius * 0.7;
            smallLeaf.position.set(
                Math.cos(angle) * distance,
                trunkHeight + leavesRadius * 0.4 + (Math.random() - 0.5) * 0.3,
                Math.sin(angle) * distance
            );
            this.group.add(smallLeaf);
        }
    }

    createPineTree() {
        const trunkHeight = 0.8;
        const trunkRadius = 0.08;

        const trunkGeometry = this.assetManager.getGeometry('cylinder', trunkRadius, trunkRadius * 1.5, trunkHeight);
        const trunkMaterial = this.assetManager.getMaterial('lambert', 0x8B4513);
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = trunkHeight / 2;
        this.group.add(trunk);

        const coneMaterial = this.assetManager.getMaterial('lambert', 0x0F5132);
        
        for (let i = 0; i < 4; i++) {
            const coneRadius = 0.6 - i * 0.12;
            const coneHeight = 0.8;
            const coneGeometry = this.assetManager.getGeometry('cone', coneRadius, coneHeight, 8);
            const cone = new THREE.Mesh(coneGeometry, coneMaterial);
            cone.position.y = trunkHeight + i * 0.4 + coneHeight / 2;
            this.group.add(cone);
        }
    }

    getHeight() {
        const boundingBox = this.getBoundingBox();
        return boundingBox.max.y - boundingBox.min.y;
    }
}