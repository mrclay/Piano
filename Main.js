import Piano from 'Piano'
import Master from 'Tone/core/Master'
import Buffer from 'Tone/core/Buffer'

var piano = new Piano([21, 108], 5).toMaster();

piano.load('./Salamander/').then(() => {
	//if (location.hash) {
	//	notes = location.hash.replace(/^#/, '').split(',');
	//}
	//
	//play();
});

function play() {

	var i, actives = document.querySelectorAll('[data-note].active');

	for (i = 0; i < actives.length; i++) {
		var note = parseInt(actives[i].dataset.note, 10);
		piano.keyDown(note);
	}

	setTimeout(() => {
		for (i = 0; i < actives.length; i++) {
			var note = parseInt(actives[i].dataset.note, 10);
			piano.keyUp(note);
		}
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

	for (note = 24; note < 85; note++) {
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
	}
});
