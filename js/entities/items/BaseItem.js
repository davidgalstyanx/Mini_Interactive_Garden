export class BaseItem {
    constructor(assetManager, type) {
        this.assetManager = assetManager;
        this.type = type;
        this.mesh = null;
        this.group = new THREE.Group();
        this.id = this.generateId();
        
        this.group.userData = {
            itemType: this.constructor.name,
            subType: type,
            id: this.id
        };
    }

    generateId() {
        return `${this.constructor.name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    create() {
        throw new Error('create() method must be implemented by subclass');
    }

    setPosition(position) {
        this.group.position.copy(position);
        this.group.position.y = 0;
    }

    getPosition() {
        return this.group.position.clone();
    }

    setScale(scale) {
        if (typeof scale === 'number') {
            this.group.scale.set(scale, scale, scale);
        } else {
            this.group.scale.copy(scale);
        }
    }

    getScale() {
        return this.group.scale.clone();
    }

    setRotation(rotation) {
        if (typeof rotation === 'number') {
            this.group.rotation.y = rotation;
        } else {
            this.group.rotation.copy(rotation);
        }
    }

    getRotation() {
        return this.group.rotation.clone();
    }

    getMesh() {
        return this.group;
    }

    enableShadows() {
        this.group.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }

    getBoundingBox() {
        const box = new THREE.Box3().setFromObject(this.group);
        return box;
    }

    clone() {
        const clonedItem = new this.constructor(this.assetManager, this.type);
        clonedItem.setPosition(this.getPosition());
        clonedItem.setScale(this.getScale());
        clonedItem.setRotation(this.getRotation());
        return clonedItem;
    }

    dispose() {
        this.group.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => mat.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            }
        });
    }
}