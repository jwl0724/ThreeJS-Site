import * as THREE from "three";
import { ModelPaths } from "../modelPaths";
import { ModelTemplate } from "./modelTemplateClass";
import { Player } from "./playerClass";
import { ProcessManager } from "./processManagerClass";
import { CameraManager } from "./cameraManagerClass";
import { CharacterModel } from "./characterModelClass";
import { ArcadeBuilder } from "./arcadeBuilderClass";
import { CollisionManager } from "./collisionManagerClass";
import { Clerk } from "./clerkClass";
import { InputManager } from "./inputManagerClass";

export { Arcade };

// Only one should exists, what the script will interface with
class Arcade {

    #renderer;
    #processManager;
    #cameraManager;
    #collisionManager;
    #inputManager;
    #animationMixers;
    #arcadeScene;
    #player;
    #clerk;

    constructor() {
        // Set data members
        this.#arcadeScene = new THREE.Scene();
        
        this.#cameraManager = new CameraManager(75, window.innerWidth / window.innerHeight, 0.1, 300);
        this.#inputManager = new InputManager(this);
        this.#animationMixers = new Array();
        
        // Setup scene properties
        this.#arcadeScene.add(new THREE.AmbientLight(0xffffe6, 2)); // Slight yellow light
        this.#renderer = new THREE.WebGLRenderer({ antialias: true });
        this.#renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.#renderer.domElement);
        
        // Set the processes
        this.#collisionManager = new CollisionManager();
        this.#processManager = new ProcessManager(this.#renderer, () => this.#renderer.render(this.#arcadeScene, this.#cameraManager.getCamera()));
        this.#processManager.addProcess((delta) => this.#animationMixers.forEach(mixer => mixer.update(delta)));
        this.#processManager.addProcess((delta) => this.#cameraManager.cameraProcess(delta));
    }

    resizeRenderWindow(x, y) {
        this.#cameraManager.setAspectRatio(x / y);
        this.#renderer.setSize(x, y);
    }

    async instantiateArcade() {
        await ArcadeBuilder.buildArcade(this.#arcadeScene, this.#collisionManager, this.#animationMixers);
    }

    async instantiatePlayer() {
        this.#player = await ArcadeBuilder.buildPlayer(this.#arcadeScene, this.#animationMixers, this.#inputManager);

        // Add player processes
        this.#processManager.addPhysicsProcess((delta) => this.#player.playerPhysicsProcess(delta));
        this.#processManager.addProcess((delta) => this.#player.playerProcess(delta));
        this.#processManager.addInputProcess(() => this.#player.playerInputProcess());
        this.#cameraManager.setTarget(this.#player.getModel());

        // Start collision system once player is instantiated
        this.#collisionManager.addPlayerClass(this.#player);
        this.#processManager.addProcess((delta) => this.#collisionManager.collisionProcess(delta));
    }

    async instantiateClerk() {
        this.#clerk = await ArcadeBuilder.buildClerk(this.#arcadeScene, this.#animationMixers, this.#inputManager);
        this.#processManager.addProcess((delta) => this.#clerk.clerkProcess(delta));
    }

    notifyInteractPressed() {
        if (this.#clerk.validInteract(this.#player)) this.enterDialogue();
        else this.exitDialogue(); // temp code
    }

    enterDialogue() {
        this.#clerk.startInteraction(this.#cameraManager.getCamera());
        this.#cameraManager.enterDialogueCamera();
        this.#inputManager.pauseInput(true);
    }

    exitDialogue() {
        this.#clerk.stopInteraction();
        this.#cameraManager.exitDialogueCamera(this.#player.getModel());
        this.#inputManager.pauseInput(false);
    }
}