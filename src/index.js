import Sound from "./Sound.js";
import Image from "./Image.js";
import Drawing from "./Drawing.js";

const canvas = document.querySelector("#main");
const ctx = canvas.getContext("2d");
const plotDiv = document.querySelector('#plot');
let drawingManager;
let soundManager;
let imageFrequencyData;

async function init() {
  const { imageData, imageBitmap } = await Image.getImage("/test2.jpeg");
  canvas.width = imageBitmap.width;
  canvas.height = imageBitmap.height;

  drawingManager = new Drawing(canvas, imageBitmap);
  drawingManager.drawFull()
  soundManager = new Sound()  

  updateFrequenciesFromDrawnImage()
}
init();

function updateFrequenciesFromDrawnImage() {
  const b = drawingManager.bbox;
  let w = (b.maxX - b.minX)
  let h =  (b.maxY - b.minY)
  if (w == 0) w = 1;
  if (h == 0) h = 1
  const drawnImageData = ctx.getImageData(b.minX, b.minY, w, h);    
  imageFrequencyData = Image.generateFrequenciesWhole(drawnImageData, b)

  //const soundFrequencies = soundManager.playImageFrequencies(imageFrequencyData)

  // Plot
  // const frequencies = soundFrequencies.map(v => v.freq)
  // const weights = soundFrequencies.map(v => v.weight)
  // Plotly.newPlot( plotDiv, [{
  // x: frequencies,
  // y: weights }]);
}

canvas.addEventListener("mouseup", async (e) => {
  // Get the imagedata of the area drawn
  if (drawingManager == undefined) return;

  updateFrequenciesFromDrawnImage();
});


document.querySelector("#clear").onclick = function () {
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawingManager.resetBounds()
  soundManager.stop()
  updateFrequenciesFromDrawnImage();
  
};

document.querySelector("#play").onclick = function () {};

const slider = document.querySelector("#slider")
slider.oninput = (e) => {
  const value = e.target.value;

  // for (let i = 0; i < imageFrequencyData.dct.length; i++) {
  //   const dct = imageFrequencyData.dct;
  //   if (dct[i] < 0) {
  //     dct[i] = 0;
  //   }
  // }

  const newImageData = Image.regenerateImageWhole(imageFrequencyData)
  const ctx = canvas.getContext("2d");
  ctx.putImageData(newImageData, 0, 0)
}