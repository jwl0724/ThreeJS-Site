// TODO: Implement some button or something to determine if load arcade or not
// For now just load the arcade directly since that's the focus
import { Arcade } from "./classes/arcadeClass";

const arcade = new Arcade();
await arcade.buildArcade();
await arcade.instantiatePlayer();

// Add event listener to resize camera when window size changes
window.addEventListener("resize", () => arcade.resizeRenderWindow(window.innerWidth, window.innerHeight));
