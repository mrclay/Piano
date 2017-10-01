import React from 'react';
import ReactDOM from 'react-dom';
import {Piano} from './Piano';
import Keyboard from './components/keyboard';
import Controls from './components/controls';
import Progress from './components/progress';
import * as C from './constants';

const piano = new Piano(C.RANGE, C.VELOCITIES, C.USE_RELEASE).toMaster();

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: 'Untitled',
            state: C.NEW_RECORDING,
			progress: 0,
            firstTime: null,
			operations: [],
			keyTimeouts: {},
        	playAllIntervals: [],
        	progressInterval: null
    	};
    }

    componentDidMount() {
        piano.load('https://cdn.rawgit.com/mrclay/Piano/5abc2fb2/Salamander/').then(this.init.bind(this));
	}

    init() {
        const m = location.hash.match(/s=(\w+)(?:&t=(.*))?/);
        if (!m) {
            return this.setPlayState(C.NEW_RECORDING);
        }

        const streamEncoded = m[1];
        const title = m[2] ? decodeURIComponent(m[2]) : '';
        const pattern = /[A-Z][a-z0-9]+/g;
        let token;
        let operations = this.state.operations.slice();

        while (token = pattern.exec(streamEncoded)) {
            let opTime = decodeOp(token[0]);

            firstTime = 0;
            operations.push([opTime[0], opTime[1]]);
        }

        this.setState({
			operations,
			title
		})

        this.setPlayState(C.STOPPED);
    }

    setPlayState(newState) {
        this.stopAll();

        let newComponentState = {
            progress: operations.length ? 1 : 0,
            state: newState
		};

        if (newState === C.PLAYING && (!this.state.operations.length)) {
        	return this.setPlayState(C.STOPPED);
		}

        switch (newState) {
            case C.NEW_RECORDING:
                newComponentState.operations = [];
                newComponentState.firstTime = undefined;
                break;

            case C.STOPPED:
                break;

            case C.PLAYING:
                this.playAll();
                break;
        }

        this.setState(newComponentState);

        // TODO just don't
        document.querySelector('body').dataset.state = newState;
    }

    stopAll() {
        if (this.state.progressInterval) {
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

    render() {
        return (
			<div>
				<h1 className="unsaved">“{this.state.title}”</h1>
				<Keyboard
					actives={[]} />
				<section>
					<Controls
						state={this.state.state} />
				</section>
				<section>
					<Progress
						ratio={this.state.progress} />
				</section>
				<section>
					<div className="input-group input-group-lg">
						<input id="title" type="text" className="form-control" placeholder="Title" />
						<span className="input-group-btn">
                        <button id="save" className="btn btn-default" type="button">
                            <i className="fa fa-floppy-o" aria-hidden="true"></i> Save to URL
                        </button>
                        </span>
					</div>
				</section>
			</div>
        );
    }
}

ReactDOM.render(
	<App />,
    document.getElementById('root')
);

window.logMidi = false;



function setProgress(ratio) {
	const el = $one('#progress');
	el.style.width = (100 * ratio) + '%';
	el.setAttribute('aria-valuenow', Math.round(100 * ratio));
	$one('#progress .progress-percentage').innerHTML = Math.round(100 * ratio);
}

function encodeOp(op, time) {
	return [
		String.fromCharCode(op[0] + C.ORD_A_UPPER),
		op[1].toString(16),
		Math.round(time).toString(36)
	].join('');
}

function decodeOp(token) {
	const command = token[0].charCodeAt(0) - C.ORD_A_UPPER;
	const note = parseInt(token.substr(1, 2), 16);
	const time = parseInt(token.substr(3), 36);
	const op = [command, note];
	return [op, time];
}

function playAll() {
	const numOperations = operations.length;
	const lastTime = operations[operations.length - 1][1] * C.TIME_RESOLUTION_DIVISOR;
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
						setState(C.STOPPED);
					}
				},
				el[1] * C.TIME_RESOLUTION_DIVISOR
			)
		);
	});
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
	setState(C.STOPPED);
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
	setState(C.NEW_RECORDING);
}

function operationFromMidi(data) {
	const op = data[0];
	const note = data[1];
	const velocity = data[2];

	if (op === C.MIDI0_PEDAL && note === C.MIDI1_PEDAL) {
		return (velocity > 0) ? [C.OP_PEDAL_DOWN, 0] : [C.OP_PEDAL_UP, 0];

	} else if (op === C.MIDI0_NOTE_OFF || velocity === C.MIDI2_RELEASE_VELOCITY) {
		if (note >= C.RANGE[0] && note <= C.RANGE[1]) {
			return [C.OP_NOTE_UP, note];
		}

	} else if (op === C.MIDI0_NOTE_ON) {
		if (note >= C.RANGE[0] && note <= C.RANGE[1]) {
			return [C.OP_NOTE_DOWN, note];
		}
	}
}

function performOperation(op) {
	switch (op[0]) {
		case C.OP_PEDAL_DOWN: return piano.pedalDown();

		case C.OP_PEDAL_UP: return piano.pedalUp();

		case C.OP_NOTE_DOWN:
			$one('[data-note="' + op[1] + '"]').classList.add('active');
			return piano.keyDown(op[1]);

		case C.OP_NOTE_UP:
			$one('[data-note="' + op[1] + '"]').classList.remove('active');
			return piano.keyUp(op[1]);
	}
}

function addOperation(op, timeInMs) {
	if (state !== C.NEW_RECORDING) {
		return;
	}

	timeInMs = Math.round(timeInMs / C.TIME_RESOLUTION_DIVISOR);
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

				if (e.data[0] === C.MIDI0_L1) {
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
			op = operationFromMidi([C.MIDI0_NOTE_OFF, note, 0]);
			addOperation(op, e.timeStamp);
			performOperation(op);
		}

		op = operationFromMidi([C.MIDI0_NOTE_ON, note, 254]);
		addOperation(op, e.timeStamp);
		performOperation(op);

		keyTimeouts['z' + note] = setTimeout(() => {
			if (keyTimeouts['z' + note]) {
				op = operationFromMidi([C.MIDI0_NOTE_OFF, note, 0]);
				addOperation(op, e.timeStamp + 1000);
				performOperation(op);
			}
		}, 1000);

		return false;
	}

	if (target.id === 'play') {
		setState(C.PLAYING);
		return false;
	}

	if (target.id === 'stop') {
		setState(C.STOPPED);
		return false;
	}

	if (target.id === 'record') {
		setState(C.NEW_RECORDING);
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

console.log('To log MIDI messages: logMidi = true');
