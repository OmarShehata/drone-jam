import Sound from "./Sound.js";
import Image from "./Image.js";
import Drawing from "./Drawing.js";

const canvas = document.querySelector("#main");

async function init() {
  const { imageData, imageBitmap } = await Image.getImage("/test2.jpeg");
  canvas.width = imageBitmap.width;
  canvas.height = imageBitmap.height;

  const drawingManager = new Drawing(canvas, imageBitmap);

  const frequencyBlocks = Image.generateFrequencies(imageData, 64);

  for (let block of frequencyBlocks.blocks) {
    for (let i = 0; i < block.dct.length; i++) {
      if (block.dct[i] < 0) block.dct[i] = 0
    }
  }

  const newImageData = Image.regenerateImage(frequencyBlocks);

  const ctx = canvas.getContext("2d");
  ctx.putImageData(newImageData, 0, 0);
  console.log(newImageData);
}
init();

canvas.addEventListener("mouseup", async (e) => {});

function update() {
  requestAnimationFrame(update);
}

update();

document.querySelector("#clear").onclick = function () {
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

document.querySelector("#play").onclick = function () {};
