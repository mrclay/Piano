import Piano from 'Piano'
import Master from 'Tone/core/Master'
import Buffer from 'Tone/core/Buffer'

var piano = new Piano([21, 108], 5).toMaster();

piano.load('./Salamander/').then(() => {
	//#n=41,48,55,60,51,58&c=F11
	var m = location.hash.match(/n=([\d,]+)&c=(.*)/);
	if (m) {
		m[1].split(',').forEach((note) => {
			document.querySelector('[data-note="' + note + '"]').classList.add('active');
		});
		document.querySelector('#chord').value = m[2];
	}
});

function getNotes() {
	var notes = [];

	document.querySelectorAll('[data-note].active').forEach((el) => {
		notes.push(parseInt(el.dataset.note, 10));
	});

	return notes;
}

function play() {

	var notes = getNotes();

	notes.forEach((note) => {
		piano.keyDown(note);
	});

	setTimeout(() => {
		notes.forEach((note) => {
			piano.keyUp(note);
		});
	}, 2000);
}

/**
 *  LOADING BAR
 */
Buffer.on('progress', (prog) => {
	document.querySelector('#loading #fill').style.width = (prog * 100).toString() + '%';
});

Buffer.on('load', (prog) => {
	document.querySelector('#loading').remove();
});

/**
 *  MIDI INPUT
 */
function parseInput(message){
	if (message[0] === 176 && message[1] == 64){
		if (message[2] > 0) {
			piano.pedalDown();
		} else {
			piano.pedalUp();
		}
	} else if (message[0] === 128){ //noteOff
		piano.keyUp(message[1]);
	} else if (message[0] === 144){ //noteOn
		piano.keyDown(message[1], message[2] / 127);
	}
}

if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess().then((midiAccess) => {
    	midiAccess.inputs.forEach((input) => {
    		input.addEventListener('midimessage', (e) => {
    			parseInput(e.data)
    		})
    	});
    });
}

window.addEventListener('DOMContentLoaded', () => {
	var whites = '', blacks = '', note, mod, left = 36;

	for (note = 36; note < 97; note++) {
		mod = note % 12;
		if (mod == 1 || mod == 3 || mod == 6 || mod == 8 || mod == 10) {
			blacks += '<div data-note=' + note + ' style="left:' + left + 'px"></div>';
			left += 34;
			if (mod == 3 || mod == 10) {
				left += 34;
			}
		} else {
			whites += '<div data-note=' + note + '></div>';
		}
	}

	document.querySelector('.white').innerHTML = whites;
	document.querySelector('.black').innerHTML = blacks;
});

window.addEventListener('click', (e) => {
	if (e.target.dataset.note) {
		if (e.target.classList.contains('active')) {
			e.target.classList.remove('active');
		} else {
			e.target.classList.add('active');
		}
		play();
		return false;
	}

	if (e.target.id == 'play') {
		play();
		return false;
	}

	if (e.target.id == 'save') {
		var chord = document.querySelector('#chord').value;
		var notes = getNotes();

		location.hash = '#n=' + notes.join(',') + '&c=' + encodeURIComponent(chord);
		location.reload();
	}
});
