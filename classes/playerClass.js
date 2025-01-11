import * as THREE from 'three';
import { CharacterModel } from './characterModelClass';
import { ModelPaths } from '../modelPaths';
import { InputManager } from './inputManagerClass';
import { getDirection } from 'three/tsl';

export { Player };

class Player {
    // Data members
    #isMoving = false;
    #inputManager;
    #moveSpeed = 1.75;
    #position = new THREE.Vector3(0, 0, 0);
    #rotation = 0; // Only rotate around the y-axis, DEBATE IF THIS IS NEEDED
    #directionVector = new THREE.Vector3(0, 0, 0);
    #collider;
    #modelClass;
    
    constructor(positionVector, rotationAngle) {
        this.#inputManager = new InputManager(this);
        this.#position = positionVector;
        this.#rotation = rotationAngle;
    }

    // PROCESS SECTION: Put code that needs to run per frame in these parts
    playerPhysicsProcess(delta) {
        this.#updateDirectionVector();
        this.#updatePosition(delta);
    }

    playerProcess(delta) {
        this.#modelClass.updateMoveAnimation(this.#isMoving, delta);
    }

    playerInputProcess() {

    }

    getModel() {
        return this.#modelClass.getModel();
    }

    getNextFramePosition(delta) {
        return this.#position.clone().add(this.#directionVector.multiplyScalar(this.#moveSpeed * delta));
    }

    notifyCollision(collider) {
        this.#collider = collider;
    }

    async createPlayer(arcadeScene, mixerCollection) {
        // Load player model
        this.#modelClass = new CharacterModel(ModelPaths.PLAYER);
        await this.#modelClass.loadModel(arcadeScene, mixerCollection);
        this.#modelClass.setPosition(this.#position.x, this.#position.y, this.#position.z);
    }

    #updateDirectionVector() {
        // Set is moving variable
        if (this.#directionVector.x === 0 && this.#directionVector.z === 0) this.#isMoving = false;
        else this.#isMoving = true;

        const inputVector = this.#inputManager.getInputVector();
        this.#directionVector = inputVector.normalize();
    }

    #updatePosition(delta) {
        const nextPoint = this.#directionVector.clone().multiplyScalar(this.#moveSpeed * delta);
        // Slide across on valid angle
        if (this.#collider) {
            const testPointX = new THREE.Vector3(
                this.#position.x, 
                this.#position.y + nextPoint.y, 
                this.#position.z + nextPoint.z
            );
            const testPointZ = new THREE.Vector3(
                this.#position.x + nextPoint.x, 
                this.#position.y + nextPoint.y, 
                this.#position.z
            );
            if (!this.#collider.containsPoint(testPointX)) {
                this.#position = testPointX;
                this.#modelClass.updateModel(this.#position);

            } else if (!this.#collider.containsPoint(testPointZ)) {
                this.#position = testPointZ;
                this.#modelClass.updateModel(this.#position);
            }
            return;
        }
        // If no collision occurs
        this.#position = this.#position.add(nextPoint);
        this.#modelClass.updateModel(this.#position);
    }
}