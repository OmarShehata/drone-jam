import * as Tone from "tone";

function map(value, min, max, start, end) {
  const range = max - min;
  const temp = (value - min) / range

  return temp * (end - start) + start
}

class Sound {
  constructor() {
    this.oscList = [];

    this.isPlaying = false;
    this.wave = new Tone.Waveform();
    Tone.Master.connect(this.wave);
  }

  getWaveData() {
    return this.wave.getValue(0);
  }

  playImageFrequencies(frequencyData) {
  	const MAX_FREQUENCY = 2000
  	const MIN_FREQUENCY = 50
  	const RANGE = (MAX_FREQUENCY - MIN_FREQUENCY)

  	const dctWeights = frequencyData.dct

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

	let range = max - min
	if (range == 0) range = 1
	let frequencies = []
	const weights = []
	for (let i = 0; i < dctWeights.length; i++) {
	    let weight = map(dctWeights[i], min, max, -10, 1)
	    if (max - min == 0) {
	    	weight = 0
	    }
	    const factor = (i / dctWeights.length)

	    const freq = factor * RANGE + MIN_FREQUENCY
	    const detune = 0
	    const phase = 0//factor * 360

	    frequencies.push({
	    	freq,
	    	weight,
	    	detune,
	    	phase
	    })
	  }

	frequencies.sort((a, b) => {
	    if (a.weight < b.weight) return 1;
	    if (a.weight > b.weight) return -1;
	    return 0;
	  })
	frequencies = frequencies.slice(4, 8)

	this.frequencies = frequencies
	this.add(this.frequencies)
	this.play()

	return frequencies
  }

  add(sounds) {
    this.oscList.forEach((osc) => {
      osc.stop();
      osc.disconnect();
    });
    this.oscList = [];

    for (let i = 0; i < sounds.length; i++) {
      let { freq, weight, detune, phase } = sounds[i];
      if (weight == undefined) weight = 0;
      if (detune == undefined) detune = 0;
      if (phase == undefined) phase = 0;

      const osc = new Tone.Oscillator({
        type: "sine4",
        //partialCount: 4,
        //frequency: 277,
        //partials: [3, 2, 1],
        frequency: freq,
        volume: weight,
        detune,
        phase,
      });
      osc.toDestination();
      this.oscList.push(osc);
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
      return;
    }

    this.play();
  }

  play() {
    this.isPlaying = true;
    this.oscList.forEach((osc) => osc.start());
  }
  stop() {
    this.isPlaying = false;
    this.oscList.forEach((osc) => osc.stop());
  }
}

export default Sound;
