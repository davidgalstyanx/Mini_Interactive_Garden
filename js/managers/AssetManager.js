export class AssetManager {
    constructor() {
        this.textures = new Map();
        this.materials = new Map();
        this.geometries = new Map();
        this.loader = new THREE.TextureLoader();
    }

    createGrassTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#4a904a';
        ctx.fillRect(0, 0, 100, 100);

        ctx.fillStyle = '#6ab46a';
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const radius = Math.random() * 3 + 1;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 4);
        
        this.textures.set('grass', texture);
        return texture;
    }

    getMaterial(type, color, options = {}) {
        const key = `${type}_${color}_${JSON.stringify(options)}`;
        
        if (this.materials.has(key)) {
            return this.materials.get(key);
        }

        let material;
        switch (type) {
            case 'lambert':
                material = new THREE.MeshLambertMaterial({ color, ...options });
                break;
            case 'basic':
                material = new THREE.MeshBasicMaterial({ color, ...options });
                break;
            case 'phong':
                material = new THREE.MeshPhongMaterial({ color, ...options });
                break;
            default:
                material = new THREE.MeshLambertMaterial({ color, ...options });
        }

        this.materials.set(key, material);
        return material;
    }

    getGeometry(type, ...params) {
        const key = `${type}_${params.join('_')}`;
        
        if (this.geometries.has(key)) {
            return this.geometries.get(key);
        }

        let geometry;
        switch (type) {
            case 'box':
                geometry = new THREE.BoxGeometry(...params);
                break;
            case 'sphere':
                geometry = new THREE.SphereGeometry(...params);
                break;
            case 'cylinder':
                geometry = new THREE.CylinderGeometry(...params);
                break;
            case 'plane':
                geometry = new THREE.PlaneGeometry(...params);
                break;
            case 'cone':
                geometry = new THREE.ConeGeometry(...params);
                break;
            case 'ring':
                geometry = new THREE.RingGeometry(...params);
                break;
            default:
                throw new Error(`Unknown geometry type: ${type}`);
        }

        this.geometries.set(key, geometry);
        return geometry;
    }

    dispose() {
        this.textures.forEach(texture => texture.dispose());
        this.materials.forEach(material => material.dispose());
        this.geometries.forEach(geometry => geometry.dispose());
        
        this.textures.clear();
        this.materials.clear();
        this.geometries.clear();
    }
}