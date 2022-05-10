import imageUrl from '../static/test2.jpeg?url';
const canvas = document.querySelector("#main");
import FastDct from './lib/FastDct.js';
import Sound from './Sound.js';

let soundGen = new Sound();
window.threshold = 0.9;

let finalImageData;
let dctLuminance;
let padding;
let imageBitmap;
const plotDiv = document.querySelector('#plot');
const waveCanvas = document.querySelector("#wave")

function getDCTFromCanvas(canvas) {
  // Assumes canvas is already black and white
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const lumValues = getLuminanceFromImageData(imageData)

  const dctLum = pad(lumValues.slice())
  padding = dctLum.length - lumValues.length;
  FastDct.fastDctLee.transform(dctLum)
  return dctLum
}
function imageFrequencyToSound(dctWeights) {
  let min;
  let max;
  for (let i = 0; i < dctWeights.length; i++) {
    const w = dctWeights[i];
    if (i == 0) {
      min = w;
      max = w;
    }
    if (w > max) max = w;
    if (w < min) min = w;
  }

  const range = max - min
  const frequencies = []
  const weights = []
  const MAX_FREQUENCY = 20000
  for (let i = 0; i < dctWeights.length; i++) {
    dctWeights[i] = (dctWeights[i] - min) / range  

    const freq = (i / dctWeights.length) * MAX_FREQUENCY
    const weight = dctWeights[i];
    frequencies.push(freq)
    weights.push(weight)
  }

  return { frequencies, weights, min, max }
}

// Example loading static file from JS
async function fetchImage() {
  const request = await fetch(imageUrl);
  const blob = await request.blob();
  imageBitmap = await createImageBitmap(blob)

  canvas.width = imageBitmap.width;
  canvas.height = imageBitmap.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imageBitmap, 0, 0)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  // Turn it black and white
  const luminanceValues = makeDataBlackAndWhite(imageData.data);
  ctx.putImageData(imageData, 0, 0);
  imageBitmap = await createImageBitmap(imageData)

  finalImageData = imageData

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function regenerateFromDCT(dctLuminance) {
  const dctCopy = dctLuminance.slice()
  FastDct.fastDctLee.inverseTransform(dctCopy)
  const finalLum = dctCopy.slice(0, dctCopy.length - padding);
  let scale = dctCopy.length / 2;
  let index = 0;
  for (let i = 0; i < finalImageData.data.length; i+= 4) {
    finalImageData.data[i] = finalLum[index] / scale;
    finalImageData.data[i + 1] = finalLum[index] / scale;
    finalImageData.data[i + 2] = finalLum[index] / scale;

    index++;
  }
}


function getLuminanceFromImageData(imageData) {
  const lumData = []
  const data = imageData.data
   for (let i = 0; i < data.length; i+= 4) {
    const r = data[i + 0];
    lumData.push(r)
  }

  return lumData
}

function makeDataBlackAndWhite(data) {
  const lumData = []
  for (let i = 0; i < data.length; i+= 4) {
    const r = data[i + 0];
    const g = data[i + 1];
    const b = data[i + 2];

    const luminance = Math.round((r + g + b) / 3);
    data[i + 0] = luminance;
    data[i + 1] = luminance;
    data[i + 2] = luminance;

    lumData.push(luminance)
  }

  return lumData
}

function pad(array) {
  // Pad an array with 0's to reach a power of 2 length.
  let nextPowerOf2 = 2 ** Math.ceil(Math.log2(array.length));
  for (let i = array.length; i < nextPowerOf2; i++) {
    array.push(0);
  }
  return array;
}

fetchImage();

const mouse = {x:0,y:0, right: false, left: false}
canvas.addEventListener("mousedown", (e) => {
  if (e.button == 0) {
    mouse.left = true;
  }
  if (e.button == 2) {
    mouse.right = true;
  }
})
canvas.addEventListener("mouseup", async (e) => {
  if (e.button == 0) {
    mouse.left = false;
  }
  if (e.button == 2) {
    mouse.right = false;
  }

  const dctLum = getDCTFromCanvas(canvas);



  const indices = Array.from(Array(dctLum.length - padding).keys())
  const frequencies = dctLum.slice(0, indices.length)
  const sound = imageFrequencyToSound(frequencies)
  Plotly.newPlot( plotDiv, [{
  x: indices,
  y: frequencies }]);

  // Filter & regen
  const range = (sound.max - sound.min)
  for (let i = 0; i < dctLum.length - padding; i++) {
    //if (dctLum[i] < sound.min + range * 0.01) dctLum[i] = 0;
    //dctLum[i] = 0;
  }

  regenerateFromDCT(dctLum)
  const ctx = canvas.getContext('2d');
  ctx.putImageData(finalImageData, 0, 0);

  
  //imageBitmap = await createImageBitmap(finalImageData)

  // Get all frequencies with weights above 0.1
  const filtered = []
  
  for (let i = 1; i < sound.frequencies.length; i++) {
    const w = sound.weights[i]
    //if (w > window.threshold ) {
      filtered.push({
        freq: Math.round(sound.frequencies[i]),
        weight: w
      })
   // }
  }

  filtered.sort((a, b) => {
    if (a.weight < b.weight) return 1;
    if (a.weight > b.weight) return -1;
    return 0;
  })
  let freq = []
  let weights = []
  for (let i = 0; i < 8; i++) {
    if (filtered[i] == undefined) break;
    freq.push(filtered[i].freq)
    weights.push(filtered[i].weight)
  }
  console.log({freq, weights, sound})

  freq = [440, 440 * 2]
  weights = [1, 0.05]
  // for (let i = 0; i < 4; i++) {
  //   freq.push(440 * i)

  //   const factor = 1 - (i / 4)
  //   weights.push(factor)
  // }
  const soundArray = []
  function add(f, w, d) {
    soundArray.push({ freq: f, weight: w, detune: d})
  }
  add(440, 1, 0)
  add(440 * 0.5, 0.6, 0.25)

  soundGen.add(soundArray)
  window.soundGen = soundGen

  soundGen.play()
})
canvas.addEventListener("mousemove", (e) => {
  const rect = event.target.getBoundingClientRect();
  let x = event.clientX - rect.left; 
  let y = event.clientY - rect.top;  

  mouse.x = x;
  mouse.y = y;
})
canvas.addEventListener('contextmenu', event => event.preventDefault());

function map(value, min, max, start, end) {
  const range = max - min;
  const temp = (value - min) / range

  return temp * (end - start) + start
}

let counter = 0;

function update() {
  const mouseDown = mouse.left || mouse.right
  if (mouseDown) {
    const ctx = canvas.getContext('2d');

    const sx = mouse.x;
    const sy = mouse.y;
    const dx = sx;
    const dy = sy;

    const w = 20;
    const h = 20;

    if (mouse.left) {
      ctx.drawImage(imageBitmap, sx, sy, w, h, dx, dy, w, h)
    } else {
      ctx.fillStyle = 'black'
      ctx.fillRect(sx, sy, w, h)
    }
  }
  requestAnimationFrame(update)

  counter ++;
  if (counter < 60) {
    return
  }
  counter = 0;

  // Draw waveform
  const buffer = soundGen.getWaveData()
  // look a trigger point where the samples are going from
  // negative to positive
  let start = 0;
  for (let i = 1; i < buffer.length; i++) {
    if (buffer[i - 1] < 0 && buffer[i] >= 0) {
      start = i;
      break; // interrupts a for loop
    }
  }

  // calculate a new end point such that we always
  // draw the same number of samples in each frame
  let end = start + buffer.length / 2;
  const ctx = waveCanvas.getContext('2d');
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  const width = canvas.width;
  const height = canvas.height * 0.1;
  const yOffset = 70

  // drawing the waveform
  ctx.beginPath();
  ctx.strokeStyle = 'white'
  for (let i = start; i < end; i++) {
    let x1 = map(i - 1, start, end, 0, width);
    let y1 = map(buffer[i - 1], -1, 1, 0, height) + yOffset;
    let x2 = map(i, start, end, 0, width);
    let y2 = map(buffer[i], -1, 1, 0, height) + yOffset;
    if (i == start) {
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
    } else {
      ctx.lineTo(x1, y1)
      ctx.lineTo(x2, y2)
    }
    //line(x1, y1, x2, y2);
  }

  ctx.stroke();

  
}

update()

document.querySelector("#clear").onclick = function() {
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}


document.querySelector("#play").onclick = function() {
  soundGen.toggle()
}