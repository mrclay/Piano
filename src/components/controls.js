import React from 'react';
import Play from './play';
import Record from './record';

export default function Controls(props) {
    return (
        <div className="btn-group" role="group">
            <Play state={props.state} />
            <Record state={props.state} />
            <button id="reset" className="btn btn-info">
                <i className="fa fa-star" aria-hidden="true"></i> <span>New</span>
            </button>
        </div>
    );
};
