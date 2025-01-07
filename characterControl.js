import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { scene, camera, loader, mixers } from "/arcadeRenderer.js";
import { loadModel } from "./characterModelHandler.js";

export { instantiatePlayer }

function instantiatePlayer() {
    loadModel();
}