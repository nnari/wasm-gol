import { Universe } from "wasm-gol";
const canvas = document.getElementById("gol-canvas");
const iteration = document.getElementById("iteration-count");
const pauseBtn = document.getElementById("pause-btn");
let paused = false;

pauseBtn.addEventListener("click", () => (paused = !paused));

const universe = Universe.new();
class TextRenderer {
  constructor() {
    this.fpsInterval = 0;
    this.lastRender = 0;
    this.now = 0;
    this.elapsed = 0;
    this.then = 0;
    this.iteration = 0;
  }

  render(fps = 5, cb) {
    this.fpsInterval = 1000 / fps;
    this.then = Date.now();
    cb.call(this);
  }
}

function renderLoop() {
  requestAnimationFrame(() => renderLoop.apply(this));
  this.now = Date.now();
  this.elapsed = this.now - this.then;
  if (this.elapsed > this.fpsInterval && !paused) {
    console.log(this.now);
    this.then = this.now - (this.elapsed % this.fpsInterval);
    canvas.textContent = universe.render();
    iteration.textContent = `Iteration ${this.iteration}`;
    universe.tick();
    this.iteration++;
  }
}

const renderer = new TextRenderer();
renderer.render(10, renderLoop);
