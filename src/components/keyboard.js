import {RANGE} from '../constants';
import Key from './key';
import React from 'react';

export default class Keyboard extends React.Component {
    constructor(props) {
        super(props);

        let state = {};
        for (let note = RANGE[0]; note <= RANGE[1]; note++) {
            state['k' + note] = false;
        }
        this.state = state;
    }

    setNoteActive(note, active) {
        const prop = 'k' + note;
        this.setState({
            prop: !!active
        })
    }

    render() {
        let whites = [], blacks = [], note, mod, left = 36, style, key;

        for (note = RANGE[0]; note <= RANGE[1]; note++) {
            mod = note % 12;
            key = 'k' + note;
            if (mod === 1 || mod === 3 || mod === 6 || mod === 8 || mod === 10) {
                blacks.push(
                    <Key key={key} note={note} left={left} active={this.state[key]} />
                );
                left += 34;
                if (mod === 3 || mod === 10) {
                    // skip a key
                    left += 34;
                }
            } else {
                whites.push(
                    <Key key={key} note={note} active={this.state[key]} />
                );
            }
        }

        return (
            <div id="piano">
                <div className="white">{whites}</div>
                <div className="black">{blacks}</div>
            </div>
        );
    }
}
