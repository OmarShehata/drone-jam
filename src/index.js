import Sound from "./Sound.js";
import Image from "./Image.js";
import Drawing from "./Drawing.js";

const canvas = document.querySelector("#main");
const ctx = canvas.getContext("2d");
const plotDiv = document.querySelector('#plot');
const minSlider = document.querySelector("#min")
const maxSlider = document.querySelector("#max")
// Combine sliders? See https://refreshless.com/nouislider/

const imageFrequencyConfig = {
  min: null,
  max: null,
  harmonizeFrequency: 1
}

let drawingManager;
let soundManager;
let imageFrequencyData;

async function init() {
  const { imageData, imageBitmap } = await Image.getImage("/test2.jpeg");
  canvas.width = imageBitmap.width;
  canvas.height = imageBitmap.height;

  drawingManager = new Drawing(canvas, imageBitmap);
  drawingManager.drawFull(100, 100)
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

  let min
  let max
  for (let i = 0; i < imageFrequencyData.dct.length; i++) {
    const dct = imageFrequencyData.dct;
    if (i == 0) {
      min = dct[i]
      max = dct[i]
    }

    min = Math.min(dct[i], min)
    max = Math.max(dct[i], max)
  }
  imageFrequencyData.originalDct = imageFrequencyData.dct.slice()
  imageFrequencyData.min = min;
  imageFrequencyData.max = max;
  minSlider.min = 0;
  minSlider.max = imageFrequencyData.dct.length
  minSlider.step = 1
  minSlider.value = 0

  maxSlider.min = 0; maxSlider.max = imageFrequencyData.dct.length
  maxSlider.step = 1
  maxSlider.value = maxSlider.max

  imageFrequencyConfig.min = 0;
  imageFrequencyConfig.max = maxSlider.max
  updateImageComponents(imageFrequencyConfig)
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

function toSoundFrequency(index, dctLength) {
  return Math.round((index / dctLength) * 10000 + 50)
}

function playImage() {
  const soundFrequencies = {}

  const {dct, originalDct} = imageFrequencyData
  let min;
  let max;

  for (let i = 1; i < dct.length; i++) {
    const weight = dct[i]
    const f = toSoundFrequency(i, dct.length)

    if (i == 1) {
      min = weight;
      max = weight;
    }
    max = Math.max(max, weight)
    min = Math.min(min, weight)

    if (soundFrequencies[f] == undefined) {
      soundFrequencies[f] = weight
    }
    if (weight > soundFrequencies[f]) {
      soundFrequencies[f] = weight
    }
  }

  const sorted = Object.keys(soundFrequencies).map(freq => {
    const weight = soundFrequencies[freq]
    return {
      freq: Number(freq),
      weight: map(weight, min, max, -30, -10)
    }
  })

  sorted.sort((a, b) => {
    if (a.weight < b.weight) return 1;
    if (a.weight > b.weight) return -1;
    return 0;
  })

  let top = sorted.slice(0, 10)

  // top = top.filter(v => {
  //   return v.freq != 51 && v.freq != 52
  // })

  soundManager.add(top)
  soundManager.play()


  //console.log(top.map(v => v.freq))
}

document.querySelector("#play").onclick = function () {
  if (soundManager.isPlaying) {
    soundManager.stop()
    return;
  }
  playImage()
};

function updateImageComponents(config) {
  const {dct, originalDct} = imageFrequencyData
  const { min, max, harmonizeFrequency } = config

  for (let i = 1; i < dct.length; i++) {
    const f = toSoundFrequency(i, dct.length)
    if (i <= min || i >= max || f % harmonizeFrequency != 0) {
      dct[i] = 0
    } else {
      dct[i] = originalDct[i]
    }
  }
  const newImageData = Image.regenerateImageWhole(imageFrequencyData)
  const ctx = canvas.getContext("2d");
  ctx.putImageData(newImageData, 0, 0)
}


document.querySelector("#harmonize").onclick = () => {
  const value = document.querySelector("#frequency").value
  imageFrequencyConfig.harmonizeFrequency = value;
  updateImageComponents(imageFrequencyConfig)

  if (!soundManager.isPlaying) {
    return
  }
  playImage()
}

// This one removes frequencies from lowest to highest
minSlider.oninput = (e) => {
  const {dct} = imageFrequencyData
  const value = e.target.value;
  imageFrequencyConfig.min = value; 

  updateImageComponents(imageFrequencyConfig)
}
maxSlider.oninput = (e) => {
  const {dct} = imageFrequencyData
  const value = e.target.value;
  imageFrequencyConfig.max = value; 

  updateImageComponents(imageFrequencyConfig)
}

minSlider.onchange = () => {
  if (!soundManager.isPlaying) {
    return
  }
  playImage()
}
maxSlider.onchange = () => {
  if (!soundManager.isPlaying) {
    return
  }
  playImage()
}


function map(value, min, max, start, end) {
  const range = max - min;
  const temp = (value - min) / range

  return temp * (end - start) + start
}