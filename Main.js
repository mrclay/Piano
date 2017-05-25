import Piano from 'Piano'
import Buffer from 'Tone/core/Buffer'

const RANGE = [36, 96];
const VELOCITIES = 1;
const USE_RELEASE = false;

const ORD_ZERO = '0'.charCodeAt(0);
const ORD_A_UPPER = 'A'.charCodeAt(0);
const ORD_A_LOWER = 'a'.charCodeAt(0);

const piano = new Piano(RANGE, VELOCITIES, USE_RELEASE).toMaster();
const $one = document.querySelector.bind(document);

var firstTime;
var operations = [];
var keyTimeouts = {};

piano.load('https://cdn.rawgit.com/mrclay/Piano/1421a768/Salamander/').then(() => {
	var m = location.hash.match(/s=(\w+)(&c=(.*))?/);
	if (!m) {
		return;
	}

	const streamEncoded = m[1];
	const titleEncoded = m[2];

	var pattern = /[A-Z][a-z0-9]+/g,
		token;

	while (token = pattern.exec(streamEncoded)) {
		var opTime = decodeOp(token[0]);
		addOperation(opTime[0], opTime[1]);
	}

	if (titleEncoded) {
		$one('#title').value = decodeURIComponent(titleEncoded);
		$one('title').textContent = decodeURIComponent(titleEncoded);
	}
});

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
	operations.forEach((el) => {
		// relying on the timer is awful, but Piano's "time" arguments just don't work.
		setTimeout(() => {
			performOperation(el[0]);
		}, el[1]);
	});
}

function save() {
	var title = $one('#title').value;

	var encoded = operations.map((el) => {
		return encodeOp(el[0], el[1]);
	}).join('');

	location.hash = '#s=' + encoded + '&c=' + encodeURIComponent(title);
	location.reload();
}

function reset() {
	operations = [];
	firstTime = undefined;
}

/**
 *  MIDI INPUT
 */
if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess().then((midiAccess) => {
    	midiAccess.inputs.forEach((input) => {
    		input.addEventListener('midimessage', (e) => {
				var op = operationFromMidi(e.data);
				if (!op) {
					return;
				}
				addOperation(op, e.timeStamp);
				performOperation(op);
    		})
    	});
    });
}

const OP_PEDAL_DOWN = 0;
const OP_PEDAL_UP = 1;
const OP_NOTE_DOWN = 2;
const OP_NOTE_UP = 3;

const ATTACK_OPERATION = 144;
const RELEASE_OPERATION = 128;
const PEDAL_OPERATION = 176;
const PEDAL_NOTE = 64;
const RELEASE_VELOCITY = 0;

function operationFromMidi(data) {
	const op = data[0],
		note = data[1],
		velocity = data[2];

	if (op === PEDAL_OPERATION && note === PEDAL_NOTE) {
		return (velocity > 0) ? [OP_PEDAL_DOWN, 0] : [OP_PEDAL_UP, 0];

	} else if (op === RELEASE_OPERATION || velocity === RELEASE_VELOCITY) {
		if (note >= RANGE[0] && note <= RANGE[1]) {
			return [OP_NOTE_UP, note];
		}

	} else if (op === ATTACK_OPERATION) {
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

function addOperation(op, time) {
	if (firstTime === undefined) {
		firstTime = time;
	}
	operations.push([op, (time - firstTime)]);
}

window.addEventListener('click', (e) => {
	var target = e.target;
	var op;
	var note;

	if (target.dataset.note) {
		note = parseInt(target.dataset.note);

		if (keyTimeouts['z' + note]) {
			clearTimeout(keyTimeouts['z' + note]);
			delete keyTimeouts['z' + note];
		}

		if (target.classList.contains('active')) {
			op = operationFromMidi([RELEASE_OPERATION, note, 0]);
			addOperation(op, e.timeStamp);
			performOperation(op);
		}

		op = operationFromMidi([ATTACK_OPERATION, note, 254]);
		addOperation(op, e.timeStamp);
		performOperation(op);

		keyTimeouts['z' + note] = setTimeout(() => {
			if (keyTimeouts['z' + note]) {
				op = operationFromMidi([RELEASE_OPERATION, note, 0]);
				addOperation(op, e.timeStamp + 1000);
				performOperation(op);
			}
		}, 1000);

		return false;
	}

	if (target.id == 'play') {
		playAll();
		return false;
	}

	if (target.id == 'stop') {
		stopAll();
		return false;
	}

	if (target.id == 'save') {
		save();
		return false;
	}

	if (target.id == 'reset') {
		reset();
		return false;
	}
});

window.addEventListener('DOMContentLoaded', () => {
	var whites = '', blacks = '', note, mod, left = 36;

	for (note = RANGE[0]; note <= RANGE[1]; note++) {
		mod = note % 12;
		if (mod == 1 || mod == 3 || mod == 6 || mod == 8 || mod == 10) {
			blacks += '<a href="#" data-note=' + note + ' style="left:' + left + 'px"></a>';
			left += 34;
			if (mod == 3 || mod == 10) {
				left += 34;
			}
		} else {
			whites += '<a href="#" data-note=' + note + '></a>';
		}
	}

	$one('.white').innerHTML = whites;
	$one('.black').innerHTML = blacks;
});
