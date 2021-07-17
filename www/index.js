import { Universe, Cell } from "wasm-gol";
import { memory } from "wasm-gol/wasm_gol_bg";

const iteration = document.getElementById("iteration-count");
const speedSlider = document.getElementById("canvas-size-slider");
const simSpeed = document.getElementById("sim-speed");
const pauseBtn = document.getElementById("pause-btn");
const restartBtn = document.getElementById("restart-btn");
let paused = false;

const urlSearchParams = new URLSearchParams(window.location.search);
const paramsWidth = urlSearchParams.get("width") || 64;
const paramsHeight = urlSearchParams.get("height") || 64;

const CELL_SIZE = 10;

const GRID_COLOR = "#050505";
const DEAD_COLOR = "#0e0e0e";
const ALIVE_COLOR = "#8fafff";

const universe = Universe.new(paramsWidth, paramsHeight);
// Canvas size
const width = universe.width();
const height = universe.height();

const canvas = document.getElementById("gol-canvas");
const ctx = canvas.getContext("2d");
canvas.height = (CELL_SIZE + 1) * height + 1;
canvas.width = (CELL_SIZE + 1) * width + 1;
pauseBtn.addEventListener("click", () => {
  pauseBtn.innerText = paused ? "Pause" : "Play";
  paused = !paused;
});
restartBtn.addEventListener("click", () => universe.restart());

const drawGrid = () => {
  ctx.beginPath();
  ctx.strokeStyle = GRID_COLOR;

  // Vertical lines.
  for (let i = 0; i <= width; i++) {
    ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
    ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
  }

  // Horizontal lines.
  for (let j = 0; j <= height; j++) {
    ctx.moveTo(0, j * (CELL_SIZE + 1) + 1);
    ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
  }

  ctx.stroke();
};
const getIndex = (row, column) => {
  return row * width + column;
};

const drawCells = () => {
  const cellsPtr = universe.cells();
  const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);

  ctx.beginPath();
  console.log(height, width);
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx = getIndex(row, col);

      ctx.fillStyle = cells[idx] === Cell.Dead ? DEAD_COLOR : ALIVE_COLOR;

      ctx.fillRect(
        col * (CELL_SIZE + 1) + 1,
        row * (CELL_SIZE + 1) + 1,
        CELL_SIZE,
        CELL_SIZE
      );
    }
  }

  ctx.stroke();
};
class Renderer {
  constructor() {
    this.fpsInterval = 0;
    this.lastRender = 0;
    this.now = 0;
    this.elapsed = 0;
    this.then = 0;
    this.iteration = 0;
    this.fps = 50;
  }

  render(cb) {
    this.then = Date.now();
    cb.call(this);
  }
}

function renderLoop() {
  requestAnimationFrame(() => renderLoop.apply(this));
  this.fpsInterval = 1000 / this.fps;
  this.now = Date.now();
  this.elapsed = this.now - this.then;
  if (this.elapsed > this.fpsInterval && !paused) {
    this.then = this.now - (this.elapsed % this.fpsInterval);
    universe.tick();
    drawGrid();
    drawCells();
    iteration.textContent = `Iteration ${this.iteration}`;
    this.iteration++;
  }
}
const renderer = new Renderer();
renderer.render(renderLoop);
// Pausing works :D

speedSlider.addEventListener("input", (event) => {
  renderer.fps = event.target.value;
  simSpeed.textContent = `Current simulation speed: ${event.target.value} fps`;
});
