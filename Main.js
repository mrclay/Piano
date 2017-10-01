import {Piano} from './src/Piano';
//import Buffer from 'Tone/core/Buffer';

const RANGE = [36, 96];
const VELOCITIES = 1;
const USE_RELEASE = false;
const TIME_RESOLUTION_DIVISOR = 4;
const ORD_A_UPPER = 'A'.charCodeAt(0);

const STOPPED = 'stopped';
const NEW_RECORDING = 'new_recording';
const PLAYING = 'playing';

const OP_PEDAL_DOWN = 0;
const OP_PEDAL_UP = 1;
const OP_NOTE_DOWN = 2;
const OP_NOTE_UP = 3;

// http://www.midimountain.com/midi/midi_status.htm
const MIDI0_NOTE_ON = 144;
const MIDI0_NOTE_OFF = 128;
const MIDI0_PEDAL = 176;
const MIDI0_L1 = 252; // L1 button on Edirol GM2
const MIDI0_TUNE = 176; // TODO use for metronome?

const MIDI1_PEDAL = 64;
const MIDI1_TUNE = 10;

const MIDI2_RELEASE_VELOCITY = 0;

const piano = new Piano(RANGE, VELOCITIES, USE_RELEASE).toMaster();
const $one = document.querySelector.bind(document);
const $all = document.querySelectorAll.bind(document);
const $record = $one('#record');
const $play = $one('#play');
const $stop = $one('#stop');

let state = STOPPED;
let firstTime;
let operations = [];
let keyTimeouts = {};
let playAllIntervals = [];
let progressInterval;

window.logMidi = false;

piano.load('https://cdn.rawgit.com/mrclay/Piano/1421a768/Salamander/').then(init);

function init() {
	const m = location.hash.match(/s=(\w+)(?:&t=(.*))?/);
	if (!m) {
		$one('body').classList.remove('loading');
		setState(NEW_RECORDING);
		return;
	}

	const streamEncoded = m[1];
	const title = m[2] ? decodeURIComponent(m[2]) : '';
	const pattern = /[A-Z][a-z0-9]+/g;
	let token;

	while (token = pattern.exec(streamEncoded)) {
		let opTime = decodeOp(token[0]);

		firstTime = 0;
		operations.push([opTime[0], opTime[1]]);
	}

	setTitle(title);

	$one('body').classList.remove('loading');
	setState(STOPPED);
}

function setState(newState) {
	// reset UI to stopped state
	stopAll();
	$record.classList.remove('active');
	$record.classList.remove('disabled');
	$stop.style.display = 'none';
	$play.style.display = '';

	if (operations.length) {
		$one('#record span').innerHTML = 'Re-record';
		$play.classList.remove('disabled');
		setProgress(1);
	} else {
		$one('#record span').innerHTML = 'Record';
		$play.classList.add('disabled');
		setProgress(0);
	}

	switch (newState) {
		case NEW_RECORDING:
			operations = [];
			firstTime = undefined;
			$record.classList.add('active');
			$record.classList.add('disabled');
			$one('#record span').innerHTML = 'Recording...';
			$play.style.display = 'none';
			$stop.style.display = '';
			break;

		case STOPPED:
			break;

		case PLAYING:
			if (!operations.length) {
				return setState(STOPPED);
			}
			playAll();
			$play.style.display = 'none';
			$stop.style.display = '';
			break;
	}

	state = newState;
	$one('body').dataset.state = newState;
}

function setProgress(ratio) {
	const el = $one('#progress');
	el.style.width = (100 * ratio) + '%';
	el.setAttribute('aria-valuenow', Math.round(100 * ratio));
	$one('#progress .progress-percentage').innerHTML = Math.round(100 * ratio);
}

function encodeOp(op, time) {
	return [
		String.fromCharCode(op[0] + ORD_A_UPPER),
		op[1].toString(16),
		Math.round(time).toString(36)
	].join('');
}

function decodeOp(token) {
	const command = token[0].charCodeAt(0) - ORD_A_UPPER;
	const note = parseInt(token.substr(1, 2), 16);
	const time = parseInt(token.substr(3), 36);
	const op = [command, note];
	return [op, time];
}

function playAll() {
	const numOperations = operations.length;
	const lastTime = operations[operations.length - 1][1] * TIME_RESOLUTION_DIVISOR;
	const startTime = (new Date).getTime();
	let numPerformed = 0;

	progressInterval = setInterval(() => {
		const now = (new Date).getTime();
		setProgress((now - startTime) / lastTime);
	}, 20);

	operations.forEach((el) => {
		// relying on the timer is awful, but Piano's "time" arguments just don't work.
		playAllIntervals.push(
			setTimeout(() => {
					performOperation(el[0]);
					numPerformed++;
					if (numPerformed === numOperations) {
						setState(STOPPED);
					}
				},
				el[1] * TIME_RESOLUTION_DIVISOR
			)
		);
	});
}

function stopAll() {
	if (progressInterval) {
		clearInterval(progressInterval);
	}
	playAllIntervals.forEach(clearTimeout);
	$all('[data-note].active').forEach((el) => {
		const note = parseInt(el.dataset.note, 10);
		piano.keyUp(note);
		el.classList.remove('active');
	});
	playAllIntervals = [];
}

function getHash() {
	const title = getTitle();

	const encoded = operations.map((el) => {
		return encodeOp(el[0], el[1]);
	}).join('');

	let hash = '#s=' + encoded;
	if (title) {
		hash += '&t=' + encodeURIComponent(title);
	}

	return hash;
}

function getTitle() {
	return $one('#title').value;
}

function save() {
	setState(STOPPED);
	location.hash = getHash();

	setTitle(getTitle());
}

function setTitle(title) {
	if (title) {
		$one('#title').value = title;
		$one('h1').textContent = '“' + title + '”';
		$one('h1').classList.remove('unsaved');
	} else {
		$one('#title').value = '';
		$one('h1').textContent = '“Untitled”';
		$one('h1').classList.add('unsaved');
	}
}

function reset() {
	stopAll();
	location.hash = '#';
	firstTime = undefined;
	operations = [];
	setTitle('');
	setState(NEW_RECORDING);
}

function operationFromMidi(data) {
	const op = data[0];
	const note = data[1];
	const velocity = data[2];

	if (op === MIDI0_PEDAL && note === MIDI1_PEDAL) {
		return (velocity > 0) ? [OP_PEDAL_DOWN, 0] : [OP_PEDAL_UP, 0];

	} else if (op === MIDI0_NOTE_OFF || velocity === MIDI2_RELEASE_VELOCITY) {
		if (note >= RANGE[0] && note <= RANGE[1]) {
			return [OP_NOTE_UP, note];
		}

	} else if (op === MIDI0_NOTE_ON) {
		if (note >= RANGE[0] && note <= RANGE[1]) {
			return [OP_NOTE_DOWN, note];
		}
	}
}

function performOperation(op) {
	switch (op[0]) {
		case OP_PEDAL_DOWN: return piano.pedalDown();

		case OP_PEDAL_UP: return piano.pedalUp();

		case OP_NOTE_DOWN:
			$one('[data-note="' + op[1] + '"]').classList.add('active');
			return piano.keyDown(op[1]);

		case OP_NOTE_UP:
			$one('[data-note="' + op[1] + '"]').classList.remove('active');
			return piano.keyUp(op[1]);
	}
}

function addOperation(op, timeInMs) {
	if (state !== NEW_RECORDING) {
		return;
	}

	timeInMs = Math.round(timeInMs / TIME_RESOLUTION_DIVISOR);
	if (firstTime === undefined) {
		firstTime = timeInMs;
	}
	operations.push([op, (timeInMs - firstTime)]);
}

/**
 *  MIDI INPUT
 */
if (navigator.requestMIDIAccess) {
	navigator.requestMIDIAccess().then((midiAccess) => {
		midiAccess.inputs.forEach((input) => {
			input.addEventListener('midimessage', (e) => {

				window.logMidi && console.log(e.data);

				if (e.data[0] === MIDI0_L1) {
					return reset();
				}

				const op = operationFromMidi(e.data);
				if (!op) {
					return;
				}
				addOperation(op, e.timeStamp);
				performOperation(op);
			})
		});
	});
}

window.addEventListener('click', (e) => {
	let target = e.target;

	if (target.parentNode.nodeName === 'BUTTON') {
		target = target.parentNode;
	}

	if (target.dataset.note) {
		e.preventDefault();
		const note = parseInt(target.dataset.note);
		let op;

		if (keyTimeouts['z' + note]) {
			clearTimeout(keyTimeouts['z' + note]);
			delete keyTimeouts['z' + note];
		}

		if (target.classList.contains('active')) {
			op = operationFromMidi([MIDI0_NOTE_OFF, note, 0]);
			addOperation(op, e.timeStamp);
			performOperation(op);
		}

		op = operationFromMidi([MIDI0_NOTE_ON, note, 254]);
		addOperation(op, e.timeStamp);
		performOperation(op);

		keyTimeouts['z' + note] = setTimeout(() => {
			if (keyTimeouts['z' + note]) {
				op = operationFromMidi([MIDI0_NOTE_OFF, note, 0]);
				addOperation(op, e.timeStamp + 1000);
				performOperation(op);
			}
		}, 1000);

		return false;
	}

	if (target.id === 'play') {
		setState(PLAYING);
		return false;
	}

	if (target.id === 'stop') {
		setState(STOPPED);
		return false;
	}

	if (target.id === 'record') {
		setState(NEW_RECORDING);
		return false;
	}

	if (target.id === 'save') {
		save();
		return false;
	}

	if (target.id === 'reset') {
		reset();
		return false;
	}
});

window.addEventListener('DOMContentLoaded', () => {
	let whites = '', blacks = '', note, mod, left = 36;

	for (note = RANGE[0]; note <= RANGE[1]; note++) {
		mod = note % 12;
		if (mod === 1 || mod === 3 || mod === 6 || mod === 8 || mod === 10) {
			blacks += '<a href="#" data-note=' + note + ' style="left:' + left + 'px"></a>';
			left += 34;
			if (mod === 3 || mod === 10) {
				left += 34;
			}
		} else {
			whites += '<a href="#" data-note=' + note + '></a>';
		}
	}

	$one('.white').innerHTML = whites;
	$one('.black').innerHTML = blacks;
});

console.log('To log MIDI messages: logMidi = true');
