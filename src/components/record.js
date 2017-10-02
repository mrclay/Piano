import React from 'react';
import {STOPPED, NEW_RECORDING, PLAYING} from '../constants';

export default function Record(props) {
    if (props.playState === STOPPED) {
        return (
            <button onClick={props.handleRecord} id="record" className="btn btn-danger">
                <i className="fa fa-circle" aria-hidden="true"></i> <span>Record</span>
            </button>
        );
    }

    return (
        <button onClick={props.handleRecord} id="record" className="btn btn-danger active disabled">
            <i className="fa fa-circle" aria-hidden="true"></i> <span>Recording...</span>
        </button>
    );
};
