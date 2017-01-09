import Piano from 'Piano'
import Buffer from 'Tone/core/Buffer'

var RANGE = [36, 96];
var VELOCITIES = 1;
var USE_RELEASE = false;

var piano = new Piano(RANGE, VELOCITIES, USE_RELEASE).toMaster();
var playingNotes = [];
var $one = document.querySelector.bind(document);
var $all = document.querySelectorAll.bind(document);

piano.load('./Salamander/').then(() => {
	var m = location.hash.match(/n=([\d,]+)&c=(.*)/);
	if (m) {
		m[1].split(',').forEach((note) => {
			toggleKey(note, false);
		});
		$one('#chord').value = decodeURIComponent(m[2]);
		$one('title').textContent = decodeURIComponent(m[2]);
	}
});

function getDepressedKeys() {
	var notes = [];
	$all('[data-note].active').forEach((el) => {
		notes.push(parseInt(el.dataset.note, 10));
	});
	return notes;
}

function playAll() {
	stopAll();
	var notes = getDepressedKeys();
	notes.forEach((note) => {
		piano.keyDown(note);
		playingNotes.push(note);
	});
}

function stopAll() {
	playingNotes.forEach((note) => {
		piano.keyUp(note);
	});
	playingNotes = [];
}

function toggleKey(value, playAfter = true) {
	var el = $one('[data-note="' + value + '"]');
	if (el.classList.contains('active')) {
		el.classList.remove('active');
	} else {
		el.classList.add('active');
	}
	playAfter && playAll();
}

/**
 *  MIDI INPUT
 */
if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess().then((midiAccess) => {
    	midiAccess.inputs.forEach((input) => {
    		input.addEventListener('midimessage', (e) => {
				if (e.data[0] === 144 && e.data[2] != 0) {
					toggleKey(e.data[1]);
				}
    		})
    	});
    });
}

window.addEventListener('click', (e) => {
	var target = e.target;
	if (target.dataset.note) {
		toggleKey(target.dataset.note);
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
		var chord = $one('#chord').value;
		var notes = getDepressedKeys();

		location.hash = '#n=' + notes.join(',') + '&c=' + encodeURIComponent(chord);
		location.reload();
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
