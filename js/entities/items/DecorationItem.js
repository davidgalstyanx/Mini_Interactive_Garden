import { BaseItem } from './BaseItem.js';

export class DecorationItem extends BaseItem {
    constructor(assetManager, subType) {
        super(assetManager, subType);
        this.lights = [];
        this.create();
        this.enableShadows();
    }

    create() {
        switch (this.type) {
            case 'lamp':
                this.createLamp();
                break;
            case 'stone':
                this.createStone();
                break;
            case 'path':
                this.createPath();
                break;
            default:
                this.createStone();
        }
    }

    createLamp() {
        const metalMaterial = this.assetManager.getMaterial('lambert', 0x2F4F4F);
        const glassMaterial = this.assetManager.getMaterial('lambert', 0xFFFFFF, {
            transparent: true,
            opacity: 0.8
        });

        const poleGeometry = this.assetManager.getGeometry('cylinder', 0.05, 0.05, 2);
        const pole = new THREE.Mesh(poleGeometry, metalMaterial);
        pole.position.y = 1;
        this.group.add(pole);

        const baseGeometry = this.assetManager.getGeometry('cylinder', 0.15, 0.15, 0.1);
        const base = new THREE.Mesh(baseGeometry, metalMaterial);
        base.position.y = 0.05;
        this.group.add(base);

        const lampHousingGeometry = this.assetManager.getGeometry('sphere', 0.25, 8, 6);
        const lampHousing = new THREE.Mesh(lampHousingGeometry, metalMaterial);
        lampHousing.position.y = 2;
        this.group.add(lampHousing);

        const lampGlassGeometry = this.assetManager.getGeometry('sphere', 0.2);
        const lampGlass = new THREE.Mesh(lampGlassGeometry, glassMaterial);
        lampGlass.position.y = 2;
        this.group.add(lampGlass);

        this.lampLight = new THREE.PointLight(0xFFFF99, 0.8, 4);
        this.lampLight.position.y = 2;
        this.lampLight.visible = false;
        this.group.add(this.lampLight);
        this.lights.push(this.lampLight);
    }

    createStone() {
        const stoneMaterial = this.assetManager.getMaterial('lambert', 0x696969);
        
        const stoneCount = 3 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < stoneCount; i++) {
            const size = 0.15 + Math.random() * 0.1;
            const stoneGeometry = this.assetManager.getGeometry('sphere', size, 6, 4);
            const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);
            
            stone.position.set(
                (Math.random() - 0.5) * 0.6,
                size * 0.5,
                (Math.random() - 0.5) * 0.6
            );
            
            stone.scale.y = 0.4 + Math.random() * 0.3;
            stone.scale.x = 0.8 + Math.random() * 0.4;
            stone.scale.z = 0.8 + Math.random() * 0.4;
            
            stone.rotation.x = (Math.random() - 0.5) * 0.3;
            stone.rotation.z = (Math.random() - 0.5) * 0.3;
            
            this.group.add(stone);
        }

        const mossPositions = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < mossPositions; i++) {
            const mossMaterial = this.assetManager.getMaterial('lambert', 0x228B22);
            const mossGeometry = this.assetManager.getGeometry('sphere', 0.03);
            const moss = new THREE.Mesh(mossGeometry, mossMaterial);
            moss.position.set(
                (Math.random() - 0.5) * 0.4,
                0.05,
                (Math.random() - 0.5) * 0.4
            );
            moss.scale.set(1, 0.3, 1);
            this.group.add(moss);
        }
    }

    createPath() {
        const stoneMaterial = this.assetManager.getMaterial('lambert', 0xD2B48C);
        
        const pathGeometry = this.assetManager.getGeometry('box', 0.8, 0.05, 0.8);
        const path = new THREE.Mesh(pathGeometry, stoneMaterial);
        path.position.y = 0.025;
        this.group.add(path);

        const edgeMaterial = this.assetManager.getMaterial('lambert', 0xA0522D);
        const edgePositions = [
            [0, 0.03, 0.4],
            [0, 0.03, -0.4],
            [0.4, 0.03, 0],
            [-0.4, 0.03, 0]
        ];

        edgePositions.forEach(pos => {
            const edgeGeometry = this.assetManager.getGeometry('box', 
                pos[2] === 0 ? 0.05 : 0.8,
                0.02,
                pos[2] === 0 ? 0.8 : 0.05
            );
            const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
            edge.position.set(...pos);
            this.group.add(edge);
        });

        for (let i = 0; i < 6; i++) {
            const jointGeometry = this.assetManager.getGeometry('cylinder', 0.02, 0.02, 0.06);
            const joint = new THREE.Mesh(jointGeometry, edgeMaterial);
            joint.position.set(
                (Math.random() - 0.5) * 0.6,
                0.06,
                (Math.random() - 0.5) * 0.6
            );
            this.group.add(joint);
        }
    }

    toggleNightMode(isNight) {
        this.lights.forEach(light => {
            light.visible = isNight;
        });
        
        if (this.type === 'lamp') {
            const lampGlass = this.group.children.find(child => 
                child.material && child.material.transparent
            );
            if (lampGlass) {
                lampGlass.material.emissive.setHex(isNight ? 0x333300 : 0x000000);
            }
        }
    }

    getLights() {
        return this.lights;
    }
}