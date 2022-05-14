import * as Tone from "tone";

class Drone {
	constructor(sounds) {
		this.oscList = []
		this.releaseTime = 2;
		this.waitTime = 0.25;
		this.stopped = false;

		this.env = new Tone.AmplitudeEnvelope({
			attack: 0.2,
			decay: 0.0,
			sustain: 1,
			release: this.releaseTime
		}).toDestination();

		for (let i = 0; i < sounds.length; i++) {
	      let { freq, weight, detune, phase } = sounds[i];
	      if (weight == undefined) weight = 0;
	      if (detune == undefined) detune = 0;
	      if (phase == undefined) phase = 0;

	      const osc = new Tone.Oscillator({
	        type: "sine4",
	        frequency: freq,
	        volume: weight,
	        detune,
	        phase,
	      });
	      osc.connect(this.env).start()
	      this.oscList.push(osc);
	  }
	}

	play() {
		if (this.disposed) return
		this.stopped = false;
		this.env.triggerAttack()
	}

	stop(done) {
		if (this.stopped) {
			return
		}
		this.stopped = true;
		// Fade out and dispose
		setTimeout(() => {
			this.env.triggerRelease()
			setTimeout(() => {
				this.dispose(done)
			}, (this.releaseTime) * 1000)
		}, this.waitTime * 1000)
		
		
		
	}

	dispose(done) {
		if (this.disposed) return 
		this.env.dispose()
		this.oscList.forEach((osc) => {
	      osc.dispose()
	    });
	    this.oscList = [];
	    this.disposed = true;

	    if (done) done()
	}
}

class Sound {
  constructor() {
    this.droneList = [];
    window.Tone = Tone
    Tone.Master.volume.value = -20

    this.isPlaying = false;
  }

  add(sounds) {
  	// Limit number of drones
  	if (this.droneList.length >= 4) {
  		const drone = this.droneList.splice(0, 1)[0]
  		drone.dispose()
  	}
  	for (let drone of this.droneList) {
  		drone.stop()
  	}
  	this.droneList = this.droneList.filter(d => d.disposed != true)
  	const newDrone = new Drone(sounds)
  	newDrone.play()
  	this.droneList.push(newDrone)

  	this.isPlaying = true;
  }

  play() {
  	this.isPlaying = true;
  	this.droneList = this.droneList.filter(d => d.disposed != true)
  	for (let drone of this.droneList) {
  		drone.play()
  	}
  }
  stop() {
  	this.isPlaying = false
  	this.droneList = this.droneList.filter(d => d.disposed != true)
  	for (let drone of this.droneList) {
  		drone.stop()
  	}
  }
}

export default Sound;
