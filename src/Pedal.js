import PianoBase from './PianoBase'
import Salamander from './Salamander'
import {createSource, randomBetween} from './Util'
import Tone, {Buffers} from 'tone'

export default class Pedal extends PianoBase {
	constructor(){
		super()

		this._downTime = Infinity

		this._currentSound = null

		this._buffers = null
	}

	load(baseUrl){
		return new Promise((success) => {
			this._buffers = new Buffers({
				up : 'pedalU1.mp3',
				down : 'pedalD1.mp3'
			}, success, baseUrl)
		})
	}

	/**
	 *  Squash the current playing sound
	 */
	_squash(time){
		if (this._currentSound){
			this._currentSound.stop(time+0.1, 0.1)
		}
		this._currentSound = null
	}

	_playSample(time, dir){
		this._currentSound = createSource(this._buffers.get(dir))
		this._currentSound.curve = 'exponential'
		this._currentSound.connect(this.output).start(time, randomBetween(0, 0.01), undefined, 0.5 * randomBetween(0.5, 1), 0.05)
	}

	down(time){
		this._squash(time)
		this._downTime = time
		this._playSample(time, 'down')
	}

	up(time){
		this._squash(time)
		this._downTime = Infinity
		this._playSample(time, 'up')
	}

	isDown(time){
		return time > this._downTime
	}
}
