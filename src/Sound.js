import * as Tone from "tone";

class Sound {
  constructor() {
    this.oscList = [];

    this.isPlaying = false;
  }

  add(sounds) {
    this.oscList.forEach((osc) => {
      osc.dispose()
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

  fadeOut() {
  	
  }
}

export default Sound;
