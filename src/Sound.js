import * as Tone from 'tone'

class Sound {
	constructor() {
		this.oscList = [];
		this.lfoList = [];

		this.isPlaying = false;
		this.wave = new Tone.Waveform()
		Tone.Master.connect(this.wave);
	}

	getWaveData() {
		return this.wave.getValue(0)
	}

	add(sounds) {
		this.oscList.forEach(osc => {
			osc.stop()
			osc.disconnect()
		})
		this.oscList = []

		this.lfoList.forEach(lfo => {
			lfo.stop()
			lfo.disconnect()
		})

		for (let i = 0; i < sounds.length; i++) {
			const { freq, weight, detune, phase } = sounds[i]

			const osc = new Tone.Oscillator({
				type: "sine",
				partialCount: 0,
				//frequency: 277,
				//partials: [3, 2, 1],
				frequency: freq,
				volume: weight,
				detune,
				phase
			})
			osc.toDestination()
			this.oscList.push(osc)
		}

		// const lfo = new Tone.LFO("4n", 440, 450).start()
		// lfo.connect(this.oscList[0].frequency)
		// this.lfoList.push(lfo)
	}

	toggle() {
		if (this.isPlaying) {
			this.stop()
			return
		}

		this.play()
	}

	play() {
		this.isPlaying = true;
		this.oscList.forEach(osc => osc.start())
	}
	stop() {
		this.isPlaying = false;
		this.oscList.forEach(osc => osc.stop())
	}
}

export default Sound;