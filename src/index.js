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
            title: C.INITIAL_TITLE,
            playState: C.NEW_RECORDING,
			progress: 0,
            firstTime: null,
			operations: [],
    	};

        this.keyTimeouts = {};
        this.playAllIntervals = [];
        this.progressInterval;
    }

    componentDidMount() {
        // MIDI
        if (navigator.requestMIDIAccess) {
            navigator.requestMIDIAccess().then((midiAccess) => {
                midiAccess.inputs.forEach((input) => {
                    input.addEventListener('midimessage', (e) => {

                        window.logMidi && console.log(e.data);

                        if (e.data[0] === C.MIDI0_L1) {
                            return this.reset();
                        }

                        const op = this.operationFromMidi(e.data);
                        if (!op) {
                            return;
                        }
                        this.addOperation(op, e.timeStamp, () => {
                            this.performOperation(op);
						});
                    })
                });
            });
        }

        this.initEvents();

        piano.load(C.RAWGIT_URL).then(this.init.bind(this));
	}

	initEvents() {
        // TODO re-do
    	window.addEventListener('click', (e) => {
            let target = e.target;

            if (target.parentNode.nodeName === 'BUTTON') {
                target = target.parentNode;
            }

            if (target.dataset.note) {
                e.preventDefault();
                const note = parseInt(target.dataset.note);
                let op;

                if (this.keyTimeouts['z' + note]) {
                    clearTimeout(this.keyTimeouts['z' + note]);
                    delete this.keyTimeouts['z' + note];
                }

                if (target.classList.contains('active')) {
                    op = this.operationFromMidi([C.MIDI0_NOTE_OFF, note, 0]);

                    // TODO this needs to be async :/
                    this.addOperation(op, e.timeStamp);

                    // TODO this needs to be async :/
                    this.performOperation(op);
                }

                op = this.operationFromMidi([C.MIDI0_NOTE_ON, note, 254]);

                // TODO this needs to be async :/
                this.addOperation(op, e.timeStamp);

                // TODO this needs to be async :/
                this.performOperation(op);

                this.keyTimeouts['z' + note] = setTimeout(() => {
                    if (this.keyTimeouts['z' + note]) {
                        op = this.operationFromMidi([C.MIDI0_NOTE_OFF, note, 0]);

                        // TODO this needs to be async :/
                        this.addOperation(op, e.timeStamp + 1000);

                        this.performOperation(op);
                    }
                }, 1000);

                return false;
            }

            if (target.id === 'play') {
                this.setPlayState(C.PLAYING);
                return false;
            }

            if (target.id === 'stop') {
                this.setPlayState(C.STOPPED);
                return false;
            }

            if (target.id === 'record') {
                this.setPlayState(C.NEW_RECORDING);
                return false;
            }

            if (target.id === 'save') {
                this.save();
                return false;
            }

            if (target.id === 'reset') {
                this.reset();
                return false;
            }
        });
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
        let newComponentState = {
        	operations: this.state.operations.slice(),
			title
		};

        while (token = pattern.exec(streamEncoded)) {
            let opTime = this.decodeOp(token[0]);

            newComponentState.firstTime = 0;
            newComponentState.operations.push([opTime[0], opTime[1]]);
        }

        this.setState(newComponentState, () => {
            this.setPlayState(C.STOPPED);
		});
    }

    setPlayState(newState, after) {
        this.stopAll();

        let newComponentState = {
            progress: this.state.operations.length ? 1 : 0,
            playState: newState
		};

        if (newState === C.PLAYING && (!this.state.operations.length)) {
        	return this.setPlayState(C.STOPPED);
		}

        switch (newState) {
            case C.NEW_RECORDING:
                newComponentState.operations = [];
                newComponentState.firstTime = undefined;
                newComponentState.title = C.INITIAL_TITLE;
                break;

            case C.STOPPED:
                break;

            case C.PLAYING:
                this.playAll();
                break;
        }

        this.setState(newComponentState, () => {
            after && after();
        	// TODO just don't
            document.querySelector('body').dataset.state = newState;
		});
    }

    stopAll() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }
        this.playAllIntervals.forEach(clearTimeout);
        // $all('[data-note].active').forEach((el) => {
        //     const note = parseInt(el.dataset.note, 10);
        //     piano.keyUp(note);
        //     el.classList.remove('active');
        // });
        this.playAllIntervals = [];
    }

    getHash() {
        const encoded = this.state.operations.map((el) => {
            return this.encodeOp(el[0], el[1]);
        }).join('');

        let hash = '#s=' + encoded;
        if (this.state.title) {
            hash += '&t=' + encodeURIComponent(this.state.title);
        }

        return hash;
    }

    save() {
        location.hash = this.getHash();
    	this.setPlayState(C.STOPPED, () => {
            this.setState({
                title: 'TODO: title from form'
            });
		});
    }

    playAll() {
        const numOperations = this.state.operations.length;
        const lastTime = this.state.operations[this.state.operations.length - 1][1] * C.TIME_RESOLUTION_DIVISOR;
        const startTime = (new Date).getTime();
        let numPerformed = 0;

        this.progressInterval = setInterval(() => {
            const now = (new Date).getTime();
            this.setState({
				progress: (now - startTime) / lastTime
			});
        }, 20);

        this.state.operations.forEach((el) => {
            // relying on the timer is awful, but Piano's "time" arguments just don't work.
            this.playAllIntervals.push(
                setTimeout(() => {
                        this.performOperation(el[0]);
                        numPerformed++;
                        if (numPerformed === numOperations) {
                            this.setPlayState(C.STOPPED);
                        }
                    },
                    el[1] * C.TIME_RESOLUTION_DIVISOR
                )
            );
        });
    }

    reset() {
        this.stopAll();
        location.hash = '#';
        this.firstTime = undefined;
        this.setPlayState(C.NEW_RECORDING);
    }

    performOperation(op) {
        switch (op[0]) {
            case C.OP_PEDAL_DOWN: return piano.pedalDown();

            case C.OP_PEDAL_UP: return piano.pedalUp();

            case C.OP_NOTE_DOWN:
                piano.keyDown(op[1]);
                // TODO activate key
                //$one('[data-note="' + op[1] + '"]').classList.add('active');
                return;

            case C.OP_NOTE_UP:
                piano.keyUp(op[1]);
            	// TODO deactivate key
                //$one('[data-note="' + op[1] + '"]').classList.remove('active');
                return;
        }
    }

    addOperation(op, timeInMs, after) {
        if (this.state.playState !== C.NEW_RECORDING) {
        	after && after();
            return;
        }

        timeInMs = Math.round(timeInMs / C.TIME_RESOLUTION_DIVISOR);
        if (this.firstTime === undefined) {
            this.firstTime = timeInMs;
        }

        this.setState({
			operations: this.state.operations.concat([[op, (timeInMs - this.firstTime)]])
		}, () => {
            after && after();
		});
    }

    encodeOp(op, time) {
        return [
            String.fromCharCode(op[0] + C.ORD_A_UPPER),
            op[1].toString(16),
            Math.round(time).toString(36)
        ].join('');
    }

    decodeOp(token) {
        const command = token[0].charCodeAt(0) - C.ORD_A_UPPER;
        const note = parseInt(token.substr(1, 2), 16);
        const time = parseInt(token.substr(3), 36);
        const op = [command, note];
        return [op, time];
    }

    operationFromMidi(data) {
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

    render() {
        return (
			<div>
				<h1 className={this.state.operations.length ? '' : 'unsaved'}>“{this.state.title}”</h1>
				<Keyboard
					actives={[]} />
				<section>
					<Controls
						playState={this.state.playState} />
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


console.log('To log MIDI messages: logMidi = true');
