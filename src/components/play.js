import React from 'react';
import {STOPPED, NEW_RECORDING, PLAYING} from '../constants';

export default function Play(props) {
    switch (props.playState) {
        case NEW_RECORDING:
            return (
                <button id="stop" className="btn btn-default">
                    <i className="fa fa-stop" aria-hidden="true"></i> <span>Stop</span>
                </button>
            );
        case STOPPED:
            if (props.hasOperations) {
                return (
                    <button id="play" className="btn btn-default">
                        <i className="fa fa-play" aria-hidden="true"></i> <span>Play</span>
                    </button>
                );
            } else {
                return (
                    <button id="play" className="btn btn-default disabled">
                      <i className="fa fa-play" aria-hidden="true"></i> <span>Play</span>
                    </button>
                );
            }
        case PLAYING:
            return (
                <button id="stop" className="btn btn-default">
                    <i className="fa fa-stop" aria-hidden="true"></i> <span>Stop</span>
                </button>
        );
        default:
            throw new Error('Unrecognized state');
    }
};
