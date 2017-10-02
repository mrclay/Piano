import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';

ReactDOM.render(
	<App />,
    document.getElementById('root')
);

window.logMidi = false;

console.log('To log MIDI messages: logMidi = true');
