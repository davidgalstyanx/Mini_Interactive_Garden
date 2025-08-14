class GardenDesigner {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.raycaster = null;
        this.mouse = null;
        this.gardenItems = [];
        this.selectedTool = null;
        this.isNightMode = false;
        this.groundPlane = null;
        this.ambientLight = null;
        this.sunLight = null;
        this.moonLight = null;

        this.init();
    }

    init() {
        this.setupScene();
        this.createGround();
        this.setupLights();
        this.setupControls();
        this.setupEventListeners();
        this.animate();
        
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
        }, 2000);

        setTimeout(() => {
            this.hideTutorial();
        }, 8000);
    }

    setupScene() {
        const canvas = document.getElementById('canvas');
        
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 8, 12);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
    }

    createGround() {
        const grassTexture = new THREE.TextureLoader().load('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3Jhc3MiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzRhOTA0YSIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjMiIGZpbGw9IiM2YWI0NmEiLz48Y2lyY2xlIGN4PSI4MCIgY3k9IjgwIiByPSIyIiBmaWxsPSIjNmFiNDZhIi8+PGNpcmNsZSBjeD0iNTAiIGN5PSI2MCIgcj0iNCIgZmlsbD0iIzZhYjQ2YSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmFzcykiLz48L3N2Zz4=');
        grassTexture.wrapS = THREE.RepeatWrapping;
        grassTexture.wrapT = THREE.RepeatWrapping;
        grassTexture.repeat.set(4, 4);

        const groundGeometry = new THREE.PlaneGeometry(20, 20);
        const groundMaterial = new THREE.MeshLambertMaterial({ 
            map: grassTexture,
            color: 0x4a904a
        });

        this.groundPlane = new THREE.Mesh(groundGeometry, groundMaterial);
        this.groundPlane.rotation.x = -Math.PI / 2;
        this.groundPlane.receiveShadow = true;
        this.scene.add(this.groundPlane);

        const borderGeometry = new THREE.RingGeometry(10, 10.2, 32);
        const borderMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const border = new THREE.Mesh(borderGeometry, borderMaterial);
        border.rotation.x = -Math.PI / 2;
        border.position.y = 0.01;
        this.scene.add(border);
    }

    setupLights() {
        this.ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(this.ambientLight);

        this.sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
        this.sunLight.position.set(10, 10, 5);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 50;
        this.sunLight.shadow.camera.left = -15;
        this.sunLight.shadow.camera.right = 15;
        this.sunLight.shadow.camera.top = 15;
        this.sunLight.shadow.camera.bottom = -15;
        this.scene.add(this.sunLight);

        this.moonLight = new THREE.DirectionalLight(0x9999ff, 0.3);
        this.moonLight.position.set(-10, 10, -5);
        this.moonLight.visible = false;
        this.scene.add(this.moonLight);
    }

    setupControls() {
        const itemButtons = document.querySelectorAll('.item-btn');
        itemButtons.forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.item-btn').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                this.selectedTool = {
                    type: button.dataset.type,
                    item: button.dataset.item
                };
            });
        });

        document.getElementById('dayNightToggle').addEventListener('click', () => {
            this.toggleDayNight();
        });

        document.getElementById('clearGarden').addEventListener('click', () => {
            this.clearAllItems();
        });

        document.getElementById('downloadApp').addEventListener('click', () => {
            alert('🌱 Thanks for trying GardenMakeover! In the full app you can save your designs, share with friends, and access 100+ more items!');
        });
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        this.renderer.domElement.addEventListener('click', (event) => this.onCanvasClick(event));
    }

    onCanvasClick(event) {
        if (!this.selectedTool) {
            alert('Please select a tool from the left panel first!');
            return;
        }

        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObject(this.groundPlane);

        if (intersects.length > 0) {
            const position = intersects[0].point;
            this.placeItem(position);
        }
    }

    createItem(type, item, position) {
        let mesh;
        const colors = {
            tree: 0x228B22,
            flower: 0xFF69B4,
            furniture: 0x8B4513,
            decoration: 0x696969
        };

        switch (type) {
            case 'tree':
                if (item === 'oak') {
                    mesh = this.createTree(0x8B4513, 0x228B22, 2);
                } else {
                    mesh = this.createPineTree();
                }
                break;
            case 'flower':
                mesh = this.createFlower(item === 'rose' ? 0xFF1493 : 0xFF69B4);
                break;
            case 'furniture':
                if (item === 'bench') {
                    mesh = this.createBench();
                } else if (item === 'fountain') {
                    mesh = this.createFountain();
                } else {
                    mesh = this.createTable();
                }
                break;
            case 'decoration':
                if (item === 'lamp') {
                    mesh = this.createLamp();
                } else if (item === 'stone') {
                    mesh = this.createStone();
                } else {
                    mesh = this.createPath();
                }
                break;
        }

        if (mesh) {
            mesh.position.copy(position);
            mesh.position.y = 0;
            mesh.scale.set(0.1, 0.1, 0.1);
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            this.scene.add(mesh);
            this.gardenItems.push(mesh);

            new THREE.Tween.Tween(mesh.scale)
                .to({ x: 1, y: 1, z: 1 }, 500)
                .easing(THREE.Tween.Easing.Back.Out)
                .start();

            new THREE.Tween.Tween(mesh.rotation)
                .to({ y: mesh.rotation.y + Math.PI * 2 }, 500)
                .easing(THREE.Tween.Easing.Quadratic.Out)
                .start();
        }
    }

    createTree(trunkColor, leafColor, height) {
        const group = new THREE.Group();

        const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.15, height * 0.4);
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: trunkColor });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = height * 0.2;
        group.add(trunk);

        const leavesGeometry = new THREE.SphereGeometry(height * 0.4);
        const leavesMaterial = new THREE.MeshLambertMaterial({ color: leafColor });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = height * 0.6;
        group.add(leaves);

        return group;
    }

    createPineTree() {
        const group = new THREE.Group();

        const trunkGeometry = new THREE.CylinderGeometry(0.08, 0.12, 0.8);
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 0.4;
        group.add(trunk);

        for (let i = 0; i < 3; i++) {
            const coneGeometry = new THREE.ConeGeometry(0.5 - i * 0.1, 0.8, 8);
            const coneMaterial = new THREE.MeshLambertMaterial({ color: 0x0F5132 });
            const cone = new THREE.Mesh(coneGeometry, coneMaterial);
            cone.position.y = 1 + i * 0.4;
            group.add(cone);
        }

        return group;
    }

    createFlower(color) {
        const group = new THREE.Group();

        const stemGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.5);
        const stemMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = 0.25;
        group.add(stem);

        const flowerGeometry = new THREE.SphereGeometry(0.15);
        const flowerMaterial = new THREE.MeshLambertMaterial({ color: color });
        const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
        flower.position.y = 0.5;
        group.add(flower);

        for (let i = 0; i < 6; i++) {
            const petalGeometry = new THREE.SphereGeometry(0.08);
            const petalMaterial = new THREE.MeshLambertMaterial({ color: color });
            const petal = new THREE.Mesh(petalGeometry, petalMaterial);
            const angle = (i / 6) * Math.PI * 2;
            petal.position.set(Math.cos(angle) * 0.15, 0.5, Math.sin(angle) * 0.15);
            group.add(petal);
        }

        return group;
    }

    createBench() {
        const group = new THREE.Group();

        const seatGeometry = new THREE.BoxGeometry(1.2, 0.1, 0.4);
        const seatMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const seat = new THREE.Mesh(seatGeometry, seatMaterial);
        seat.position.y = 0.4;
        group.add(seat);

        const backGeometry = new THREE.BoxGeometry(1.2, 0.6, 0.1);
        const back = new THREE.Mesh(backGeometry, seatMaterial);
        back.position.set(0, 0.7, -0.15);
        group.add(back);

        for (let i = 0; i < 4; i++) {
            const legGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.4);
            const leg = new THREE.Mesh(legGeometry, seatMaterial);
            const x = i < 2 ? -0.5 : 0.5;
            const z = i % 2 === 0 ? -0.15 : 0.15;
            leg.position.set(x, 0.2, z);
            group.add(leg);
        }

        return group;
    }

    createTable() {
        const group = new THREE.Group();

        const topGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.05);
        const topMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.y = 0.7;
        group.add(top);

        const legGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.7);
        const leg = new THREE.Mesh(legGeometry, topMaterial);
        leg.position.y = 0.35;
        group.add(leg);

        return group;
    }

    createFountain() {
        const group = new THREE.Group();

        const baseGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.2);
        const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x708090 });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.1;
        group.add(base);

        const centerGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.8);
        const center = new THREE.Mesh(centerGeometry, baseMaterial);
        center.position.y = 0.5;
        group.add(center);

        const topGeometry = new THREE.SphereGeometry(0.15);
        const topMaterial = new THREE.MeshLambertMaterial({ color: 0x87CEEB });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.y = 0.9;
        group.add(top);

        return group;
    }

    createLamp() {
        const group = new THREE.Group();

        const poleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2);
        const poleMaterial = new THREE.MeshLambertMaterial({ color: 0x2F4F4F });
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.y = 1;
        group.add(pole);

        const lampGeometry = new THREE.SphereGeometry(0.2);
        const lampMaterial = new THREE.MeshLambertMaterial({ 
            color: this.isNightMode ? 0xFFFF99 : 0xFFFFFF,
            emissive: this.isNightMode ? 0x333300 : 0x000000
        });
        const lamp = new THREE.Mesh(lampGeometry, lampMaterial);
        lamp.position.y = 2;
        group.add(lamp);

        if (this.isNightMode) {
            const light = new THREE.PointLight(0xFFFF99, 0.5, 3);
            light.position.y = 2;
            group.add(light);
        }

        return group;
    }

    createStone() {
        const group = new THREE.Group();
        
        for (let i = 0; i < 3; i++) {
            const stoneGeometry = new THREE.SphereGeometry(0.15 + Math.random() * 0.1, 6, 4);
            const stoneMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
            const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);
            stone.position.set((Math.random() - 0.5) * 0.5, 0.1, (Math.random() - 0.5) * 0.5);
            stone.scale.y = 0.5;
            group.add(stone);
        }

        return group;
    }

    createPath() {
        const pathGeometry = new THREE.BoxGeometry(0.8, 0.05, 0.8);
        const pathMaterial = new THREE.MeshLambertMaterial({ color: 0xD2B48C });
        const path = new THREE.Mesh(pathGeometry, pathMaterial);
        path.position.y = 0.025;
        return path;
    }

    placeItem(position) {
        if (position.x >= -9 && position.x <= 9 && position.z >= -9 && position.z <= 9) {
            this.createItem(this.selectedTool.type, this.selectedTool.item, position);
        } else {
            alert('Please place items within the garden area!');
        }
    }

    toggleDayNight() {
        this.isNightMode = !this.isNightMode;
        const button = document.getElementById('dayNightToggle');

        if (this.isNightMode) {
            this.scene.background = new THREE.Color(0x191970);
            this.ambientLight.intensity = 0.2;
            this.sunLight.visible = false;
            this.moonLight.visible = true;
            button.textContent = '☀️ Day Mode';
            button.classList.add('active');
        } else {
            this.scene.background = new THREE.Color(0x87CEEB);
            this.ambientLight.intensity = 0.4;
            this.sunLight.visible = true;
            this.moonLight.visible = false;
            button.textContent = '🌙 Night Mode';
            button.classList.remove('active');
        }
    }

    clearAllItems() {
        if (confirm('Are you sure you want to clear all items?')) {
            this.gardenItems.forEach(item => {
                this.scene.remove(item);
            });
            this.gardenItems = [];
            
            document.querySelectorAll('.item-btn').forEach(btn => btn.classList.remove('active'));
            this.selectedTool = null;
        }
    }

    hideTutorial() {
        const tutorial = document.getElementById('tutorial');
        tutorial.classList.add('hidden');
        setTimeout(() => {
            tutorial.style.display = 'none';
        }, 500);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        this.gardenItems.forEach((item, index) => {
            if (item.userData && item.userData.animate) {
                item.rotation.y += 0.01;
            }
        });

        if (typeof THREE.Tween !== 'undefined') {
            THREE.Tween.update();
        }

        this.renderer.render(this.scene, this.camera);
    }
}

THREE.Tween = {
    Tween: class {
        constructor(object) {
            this.object = object;
            this.startValues = {};
            this.endValues = {};
            this.duration = 1000;
            this.easingFunction = (t) => t;
            this.onCompleteCallback = null;
            this.startTime = null;
        }

        to(values, duration) {
            this.endValues = values;
            this.duration = duration || 1000;
            return this;
        }

        easing(easingFunction) {
            this.easingFunction = easingFunction;
            return this;
        }

        onComplete(callback) {
            this.onCompleteCallback = callback;
            return this;
        }

        start() {
            this.startTime = Date.now();
            for (let key in this.endValues) {
                this.startValues[key] = this.object[key];
            }
            THREE.Tween.add(this);
            return this;
        }

        update() {
            const elapsed = Date.now() - this.startTime;
            const progress = Math.min(elapsed / this.duration, 1);
            const easedProgress = this.easingFunction(progress);

            for (let key in this.endValues) {
                this.object[key] = this.startValues[key] + (this.endValues[key] - this.startValues[key]) * easedProgress;
            }

            if (progress >= 1) {
                if (this.onCompleteCallback) {
                    this.onCompleteCallback();
                }
                return false;
            }
            return true;
        }
    },

    Easing: {
        Linear: {
            None: (t) => t
        },
        Quadratic: {
            In: (t) => t * t,
            Out: (t) => t * (2 - t),
            InOut: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
        },
        Back: {
            In: (t) => t * t * ((1.70158 + 1) * t - 1.70158),
            Out: (t) => --t * t * ((1.70158 + 1) * t + 1.70158) + 1,
            InOut: (t) => t < 0.5 ? 2 * t * t * ((1.70158 * 1.525 + 1) * 2 * t - 1.70158 * 1.525) : (2 * t - 2) * (2 * t - 2) * ((1.70158 * 1.525 + 1) * (2 * t - 2) + 1.70158 * 1.525) + 2
        }
    },

    activeTweens: [],

    add(tween) {
        this.activeTweens.push(tween);
    },

    update() {
        this.activeTweens = this.activeTweens.filter(tween => tween.update());
    }
};

document.addEventListener('DOMContentLoaded', () => {
    new GardenDesigner();
});