import * as THREE from 'three';
import { ClickManager } from './clickManagerClass';
import { VectorUtils } from '../utils/vectorUtilsClass';

export { InputManager };

class InputManager {

    // Associated classes
    #arcadeClass;
    #clickManager;

    // Running variables
    #pressedKeys = new Set();
    #mouseWorldPos = null;
    #pointerHeld = false;
    #isPaused = false;

    constructor(arcadeClass) {
        this.#arcadeClass = arcadeClass;
        this.#clickManager = new ClickManager(arcadeClass.getScene(), arcadeClass.getCamera());

        this.#setupKeyboardReading();
        this.#setupMouseInputReading();
    }

    getInputVector(playerPosition) {
        if (this.#isPaused) return new THREE.Vector3(0, 0, 0) // return no direction for no movement

        // Cancel movement order if a keyboard button was pressed
        if (this.#pressedKeys.has("w") || this.#pressedKeys.has("a") || this.#pressedKeys.has("s") || this.#pressedKeys.has("d"))
            this.#mouseWorldPos = null;

        if (this.#mouseWorldPos) {
            // If player is already at the position that was clicked on, return 0 input vector
            if (VectorUtils.approxEqualsVector3(this.#mouseWorldPos, playerPosition, 0.1)) {
                this.#mouseWorldPos = null;
                return new THREE.Vector3(0, 0, 0);
            }
            const direction = this.#mouseWorldPos.clone().sub(playerPosition);
            const inputVector = direction.normalize();
            return inputVector;
        }

        let horizontal = 0, vertical = 0;
        if (this.#pressedKeys.has("w")) vertical -= 1;
        if (this.#pressedKeys.has("a")) horizontal -= 1;
        if (this.#pressedKeys.has("s")) vertical += 1;
        if (this.#pressedKeys.has("d")) horizontal += 1;
        return new THREE.Vector3(horizontal, 0, vertical);
    }

    getSprintKeyPressed() {
        return this.#pressedKeys.has("shift");
    }

    pauseInput(pause) {
        this.#isPaused = pause;
    }

    #setupKeyboardReading() {
        // For when key is pressed/held
        document.addEventListener("keydown", (event) => {
            const key = event.key.toLowerCase();
            if (key === "w") this.#pressedKeys.add("w");
            if (key === "a") this.#pressedKeys.add("a");
            if (key === "s") this.#pressedKeys.add("s");
            if (key === "d") this.#pressedKeys.add("d");
            if (key === "shift") this.#pressedKeys.add("shift"); // sprint key
        });

        // For when key is released (i.e. not held anymore)
        document.addEventListener("keyup", (event) => {
            const key = event.key.toLowerCase();
            if (key == "w") this.#pressedKeys.delete("w");
            if (key == "a") this.#pressedKeys.delete("a");
            if (key == "s") this.#pressedKeys.delete("s");
            if (key == "d") this.#pressedKeys.delete("d");
            if (key === "shift") this.#pressedKeys.delete("shift");
        });

        // For when interact is pressed
        document.addEventListener("keypress", (event) => {
            const key = event.key.toLowerCase();
            if (key === "e") this.#arcadeClass.notifyInteractPressed();
        })

        // Add external circumstances where key pressed need to be cleared
        this.#addPressedKeyClearEvents("blur", "contextmenu");
    }

    // TODO: Need to have some UI element that allows changing of camera offsetting to be higher position
    #setupMouseInputReading() {
        // For interacting with the mouse
        document.addEventListener("pointerdown", (mouseEvent) => {
            if (mouseEvent.button !== 0) return;

            this.#pointerHeld = true;
            if (mouseEvent.target.tagName === "BUTTON" || this.#isPaused) return; // Ignore clicks on button or when input is paused
            this.#mouseWorldPos = this.#clickManager.getClickPosition(mouseEvent);
        });

        document.addEventListener("pointerup", (mouseEvent) => {
            if (mouseEvent.button === 0) this.#pointerHeld = false;
        });

        document.addEventListener("pointermove", (mouseEvent) => {
            if (this.#pointerHeld === false || this.#isPaused) return;
            this.#mouseWorldPos = this.#clickManager.getClickPosition(mouseEvent);
        })
    }

    #addPressedKeyClearEvents(...events) {
        events.forEach(event => {
            window.addEventListener(event, () => this.#pressedKeys.clear())
        });
    }
}