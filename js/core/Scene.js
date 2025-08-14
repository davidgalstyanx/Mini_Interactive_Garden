import { EventEmitter } from './EventEmitter.js';
import { GameConfig } from '../config/GameConfig.js';

export class Scene extends EventEmitter {
    constructor() {
        super();
        this.scene = new THREE.Scene();
        this.camera = null;
        this.renderer = null;
        this.lights = {};
        this.isNightMode = false;
        
        this.initializeScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLights();
    }

    initializeScene() {
        this.scene.background = new THREE.Color(GameConfig.SCENE.BACKGROUND_DAY);
    }

    setupCamera() {
        const config = GameConfig.SCENE;
        this.camera = new THREE.PerspectiveCamera(
            config.CAMERA_FOV,
            window.innerWidth / window.innerHeight,
            config.CAMERA_NEAR,
            config.CAMERA_FAR
        );
        
        this.camera.position.set(
            config.CAMERA_POSITION.x,
            config.CAMERA_POSITION.y,
            config.CAMERA_POSITION.z
        );
        this.camera.lookAt(0, 0, 0);
    }

    setupRenderer() {
        const canvas = document.getElementById('canvas');
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    setupLights() {
        const lightConfig = GameConfig.LIGHTING;
        
        this.lights.ambient = new THREE.AmbientLight(0x404040, lightConfig.AMBIENT_DAY);
        this.scene.add(this.lights.ambient);

        this.lights.sun = new THREE.DirectionalLight(
            lightConfig.SUN_COLOR, 
            lightConfig.SUN_INTENSITY
        );
        this.lights.sun.position.set(
            lightConfig.SUN_POSITION.x,
            lightConfig.SUN_POSITION.y,
            lightConfig.SUN_POSITION.z
        );
        this.setupShadows(this.lights.sun);
        this.scene.add(this.lights.sun);

        this.lights.moon = new THREE.DirectionalLight(
            lightConfig.MOON_COLOR,
            lightConfig.MOON_INTENSITY
        );
        this.lights.moon.position.set(
            lightConfig.MOON_POSITION.x,
            lightConfig.MOON_POSITION.y,
            lightConfig.MOON_POSITION.z
        );
        this.lights.moon.visible = false;
        this.scene.add(this.lights.moon);
    }

    setupShadows(light) {
        light.castShadow = true;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = 50;
        light.shadow.camera.left = -15;
        light.shadow.camera.right = 15;
        light.shadow.camera.top = 15;
        light.shadow.camera.bottom = -15;
    }

    add(object) {
        this.scene.add(object);
        this.emit('object:added', object);
    }

    remove(object) {
        this.scene.remove(object);
        this.emit('object:removed', object);
    }

    toggleDayNight() {
        this.isNightMode = !this.isNightMode;
        
        if (this.isNightMode) {
            this.scene.background = new THREE.Color(GameConfig.SCENE.BACKGROUND_NIGHT);
            this.lights.ambient.intensity = GameConfig.LIGHTING.AMBIENT_NIGHT;
            this.lights.sun.visible = false;
            this.lights.moon.visible = true;
        } else {
            this.scene.background = new THREE.Color(GameConfig.SCENE.BACKGROUND_DAY);
            this.lights.ambient.intensity = GameConfig.LIGHTING.AMBIENT_DAY;
            this.lights.sun.visible = true;
            this.lights.moon.visible = false;
        }

        this.emit('daynight:toggled', this.isNightMode);
        return this.isNightMode;
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    getScene() {
        return this.scene;
    }

    getCamera() {
        return this.camera;
    }

    getRenderer() {
        return this.renderer;
    }
}