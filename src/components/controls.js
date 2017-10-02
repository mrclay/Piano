import React from 'react';
import Play from './play';
import Record from './record';

export default function Controls(props) {
    return (
        <div className="btn-group" role="group">
            <Play playState={props.playState} hasOperations={props.hasOperations} />
            <Record playState={props.playState} />
            <button id="reset" className="btn btn-info">
                <i className="fa fa-star" aria-hidden="true"></i> <span>New</span>
            </button>
        </div>
    );
};
