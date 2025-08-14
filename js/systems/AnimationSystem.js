export class AnimationSystem {
    constructor() {
        this.activeTweens = [];
        this.easingFunctions = this.createEasingFunctions();
    }

    createEasingFunctions() {
        return {
            linear: t => t,
            easeInQuad: t => t * t,
            easeOutQuad: t => t * (2 - t),
            easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
            easeOutBack: t => --t * t * ((1.70158 + 1) * t + 1.70158) + 1,
            easeInBack: t => t * t * ((1.70158 + 1) * t - 1.70158)
        };
    }

    animate(object, targetValues, options = {}) {
        const {
            duration = 1000,
            easing = 'easeOutQuad',
            onComplete = null,
            onUpdate = null,
            delay = 0
        } = options;

        const tween = new Tween(object, targetValues, {
            duration,
            easing: this.easingFunctions[easing] || this.easingFunctions.linear,
            onComplete,
            onUpdate,
            delay
        });

        this.activeTweens.push(tween);
        tween.start();
        return tween;
    }

    animateScale(object, targetScale = 1, options = {}) {
        return this.animate(object.scale, 
            { x: targetScale, y: targetScale, z: targetScale }, 
            { easing: 'easeOutBack', duration: 500, ...options }
        );
    }

    animateRotation(object, rotations = 1, options = {}) {
        return this.animate(object.rotation,
            { y: object.rotation.y + Math.PI * 2 * rotations },
            { duration: 500, ...options }
        );
    }

    animatePosition(object, targetPosition, options = {}) {
        return this.animate(object.position, targetPosition, options);
    }

    update() {
        this.activeTweens = this.activeTweens.filter(tween => {
            const isActive = tween.update();
            if (!isActive) {
                tween.complete();
            }
            return isActive;
        });
    }

    clear() {
        this.activeTweens.forEach(tween => tween.stop());
        this.activeTweens = [];
    }
}

class Tween {
    constructor(object, targetValues, options) {
        this.object = object;
        this.targetValues = targetValues;
        this.startValues = {};
        this.duration = options.duration;
        this.easingFunction = options.easing;
        this.onComplete = options.onComplete;
        this.onUpdate = options.onUpdate;
        this.delay = options.delay || 0;
        this.startTime = null;
        this.isActive = false;
    }

    start() {
        setTimeout(() => {
            this.startTime = Date.now();
            for (let key in this.targetValues) {
                this.startValues[key] = this.object[key];
            }
            this.isActive = true;
        }, this.delay);
        return this;
    }

    update() {
        if (!this.isActive || !this.startTime) return true;

        const elapsed = Date.now() - this.startTime;
        const progress = Math.min(elapsed / this.duration, 1);
        const easedProgress = this.easingFunction(progress);

        for (let key in this.targetValues) {
            if (this.object[key] !== undefined) {
                this.object[key] = this.startValues[key] + 
                    (this.targetValues[key] - this.startValues[key]) * easedProgress;
            }
        }

        if (this.onUpdate) {
            this.onUpdate(progress);
        }

        return progress < 1;
    }

    complete() {
        if (this.onComplete) {
            this.onComplete();
        }
    }

    stop() {
        this.isActive = false;
    }
}