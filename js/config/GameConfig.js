export class GameConfig {
    static get SCENE() {
        return {
            BACKGROUND_DAY: 0x87CEEB,
            BACKGROUND_NIGHT: 0x191970,
            CAMERA_POSITION: { x: 0, y: 8, z: 12 },
            CAMERA_FOV: 75,
            CAMERA_NEAR: 0.1,
            CAMERA_FAR: 1000
        };
    }

    static get GARDEN() {
        return {
            SIZE: 20,
            BOUNDARY: 9,
            GROUND_COLOR: 0x4a904a,
            BORDER_COLOR: 0x8B4513,
            TEXTURE_REPEAT: 4
        };
    }

    static get LIGHTING() {
        return {
            AMBIENT_DAY: 0.4,
            AMBIENT_NIGHT: 0.2,
            SUN_COLOR: 0xffffff,
            SUN_INTENSITY: 1.2,
            SUN_POSITION: { x: 10, y: 10, z: 5 },
            MOON_COLOR: 0x9999ff,
            MOON_INTENSITY: 0.3,
            MOON_POSITION: { x: -10, y: 10, z: -5 }
        };
    }

    static get ITEMS() {
        return {
            CATEGORIES: {
                PLANTS: 'plants',
                FURNITURE: 'furniture',
                DECORATIONS: 'decorations'
            },
            COLORS: {
                tree: 0x228B22,
                flower: 0xFF69B4,
                furniture: 0x8B4513,
                decoration: 0x696969
            },
            SCALE_ANIMATION: {
                duration: 500,
                from: 0.1,
                to: 1
            }
        };
    }

    static get UI() {
        return {
            TUTORIAL_DURATION: 8000,
            LOADING_DURATION: 2000,
            ANIMATION_DURATION: 300
        };
    }
}