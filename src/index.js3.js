import imageUrl from '../static/test2.jpeg?url';
const canvas = document.querySelector("#main");
import FastDct from './lib/FastDct.js';
import * as Tone from 'tone'

/*

See: https://glitch.com/edit/#!/dandy-towering-snake?path=sketch.js%3A26%3A14

*/

let finalImageData;
let dctLuminance;
let padding;

// Example loading static file from JS
async function fetchImage() {
  const request = await fetch(imageUrl);
  const blob = await request.blob();
  const imageBitmap = await createImageBitmap(blob)

  canvas.width = imageBitmap.width;
  canvas.height = imageBitmap.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imageBitmap, 0, 0)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  // Turn it black and white
  const luminanceValues = makeDataBlackAndWhite(imageData.data);
  ctx.putImageData(imageData, 0, 0);

  dctLuminance = pad(luminanceValues.slice())
  padding = dctLuminance.length - luminanceValues.length;
  FastDct.fastDctLee.transform(dctLuminance)

  // Filter 
  for (let i = 0; i < dctLuminance.length - padding; i++) {
    if (dctLuminance[i] < 0) {
      //dctLuminance[i] = 2000;
    }
  }

  const dctCopy = dctLuminance.slice()
  FastDct.fastDctLee.inverseTransform(dctCopy)
  const finalLum = dctCopy.slice(0, dctCopy.length - padding);
  let scale = dctCopy.length / 2;
  let index = 0;
  for (let i = 0; i < imageData.data.length; i+= 4) {
    imageData.data[i] = finalLum[index] / scale;
    imageData.data[i + 1] = finalLum[index] / scale;
    imageData.data[i + 2] = finalLum[index] / scale;

    index++;
  }
  finalImageData = imageData

  ctx.putImageData(finalImageData, 0, 0);
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



function drawWindow(ctx, x, y, size) {
  ctx.strokeStyle = 'rgb(255, 0, 0)'
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, size, size);
}

//create a synth and connect it to the main output (your speakers)
const synth = new Tone.Synth().toDestination();

const env = new Tone.AmplitudeEnvelope({
  attack: 0.11,
  decay: 0.21,
  sustain: 0.5,
  release: 1.2
}).toDestination();


let oscList = []
const f = 200

const osc = new Tone.Oscillator({
   type: "custom",
   frequency: f,
   partials: [1.0, 0, 1.0, 0]
})
osc.connect(env); 
oscList.push(osc);


// const osc = new Tone.Oscillator({
//    type: "custom",
//    frequency: 440,
//    partials: [1.0],
//    volume: 0
// })
// osc.connect(env); 
// oscList.push(osc);

// const osc2 = new Tone.Oscillator({
//    type: "custom",
//    frequency: 440 * 2,
//    partials: [1.0],
//    volume: 0.0
// })
// osc2.connect(env)
// oscList.push(osc2)

// const osc2 = new Tone.Oscillator({
//   partials: [1],
//   type: "custom",
//   frequency: 440,
//   volume: 1,
// }).connect(env2)

let started = false;

canvas.addEventListener("click", async function(event) {
  if (!started) {
    started = true;
    await Tone.start()
    oscList.forEach(o => o.start())
  }

  osc.partials = new Array(1).fill(0).map(() => Math.random())
  // create an oscillator and connect it to the envelope
  env.triggerAttack()
  await sleep(100)
  env.triggerRelease();
  // oscList.forEach(o => o.start())
  // await sleep(1000)
  // oscList.forEach(o => o.stop())

  const ctx = canvas.getContext('2d');

  const rect = event.target.getBoundingClientRect();
  let x = event.clientX - rect.left; //x position within the element.
  let y = event.clientY - rect.top;  //y position within the element.

  // for (let i = 0; i < dctLuminance.length - padding; i++) {
  //   if (dctLuminance[i] < 0) {
  //     dctLuminance[i] = 0;
  //   }
  // }
  window.dctLuminance = dctLuminance

  regenerateFromDCT(dctLuminance)

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.putImageData(finalImageData, 0, 0);
  drawWindow(ctx, x, y, 10);


  
})



async function sleep(num) {
  return new Promise((resolve, reject) => {
    setTimeout(() => { resolve() }, num)
  })
}

// For inspiration https://jsfiddle.net/puc4onau/
async function init() {
  await sleep(1000)
}


window.Tone = Tone