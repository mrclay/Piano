!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t(require("tone")):"function"==typeof define&&define.amd?define(["tone"],t):"object"==typeof exports?exports.Piano=t(require("tone")):e.Piano=t(e.tone)}(this,function(e){return function(e){function t(r){if(n[r])return n[r].exports;var o=n[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,t),o.l=!0,o.exports}var n={};return t.m=e,t.c=n,t.d=function(e,n,r){t.o(e,n)||Object.defineProperty(e,n,{configurable:!1,enumerable:!0,get:r})},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=4)}([function(t,n){t.exports=e},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(2);t.default={getReleasesUrl:function(e){return"rel"+(e-20)+".[mp3|ogg]"},getHarmonicsUrl:function(e){return"harmL"+(0,r.midiToNote)(e).replace("#","s")+".[mp3|ogg]"},getNotesUrl:function(e,t){return(0,r.midiToNote)(e).replace("#","s")+"v"+t+".[mp3|ogg]"}}},function(e,t,n){"use strict";function r(e){return(0,s.Frequency)(e).toMidi()}function o(e){return(0,s.Frequency)(e,"midi").toNote()}function i(e){var t=e%3;return 1===t?[e-1,l.default.intervalToFrequencyRatio(1)]:2===t?[e+1,l.default.intervalToFrequencyRatio(-1)]:[e,1]}function u(e){return new s.BufferSource(e)}function a(e,t){return Math.random()*(t-e)+e}Object.defineProperty(t,"__esModule",{value:!0}),t.randomBetween=t.midiToFrequencyRatio=t.createSource=t.noteToMidi=t.midiToNote=void 0;var s=n(0),l=function(e){return e&&e.__esModule?e:{default:e}}(s);t.midiToNote=o,t.noteToMidi=r,t.createSource=u,t.midiToFrequencyRatio=i,t.randomBetween=a},function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function o(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function i(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0});var u=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),a=n(0),s=function(e){return e&&e.__esModule?e:{default:e}}(a),l=function(e){function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0;r(this,t);var n=o(this,(t.__proto__||Object.getPrototypeOf(t)).call(this));return n.createInsOuts(0,1),n.volume=e,n}return i(t,e),u(t,[{key:"volume",get:function(){return s.default.gainToDb(this.output.gain.value)},set:function(e){this.output.gain.value=s.default.dbToGain(e)}}]),t}(a.AudioNode);t.default=l},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function u(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0}),t.Piano=void 0;var a=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),s=n(0),l=r(s),c=n(5),f=r(c),p=n(6),h=n(7),d=r(h),_=n(8),y=r(_),v=n(1);r(v),t.Piano=function(e){function t(){o(this,t);var e=l.default.defaults(arguments,["range","velocities","release"],{velocities:1,range:[21,108],release:!0}),n=i(this,(t.__proto__||Object.getPrototypeOf(t)).call(this));return n.createInsOuts(0,1),n._loaded=!1,n._heldNotes=new Map,n._sustainedNotes=new Map,n._notes=new p.Notes(e.range,e.velocities).connect(n.output),n._pedal=(new f.default).connect(n.output),e.release&&(n._harmonics=new d.default(e.range).connect(n.output),n._release=new y.default(e.range).connect(n.output)),n}return u(t,e),a(t,[{key:"load",value:function(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"https://tambien.github.io/Piano/Salamander/",n=[this._notes.load(t),this._pedal.load(t)];return this._harmonics&&n.push(this._harmonics.load(t)),this._release&&n.push(this._release.load(t)),Promise.all(n).then(function(){e._loaded=!0})}},{key:"pedalDown",value:function(e){return this.loaded&&(e=this.toSeconds(e),this._pedal.isDown(e)||this._pedal.down(e)),this}},{key:"pedalUp",value:function(e){var t=this;return this.loaded&&(e=this.toSeconds(e),this._pedal.isDown(e)&&(this._pedal.up(e),this._sustainedNotes.forEach(function(n,r){t._heldNotes.has(r)||t._notes.stop(r,e)}),this._sustainedNotes.clear())),this}},{key:"keyDown",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:l.default.now(),n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:.8;return this.loaded&&(t=this.toSeconds(t),l.default.isString(e)&&(e=Math.round((0,s.Frequency)(e).toMidi())),this._heldNotes.has(e)||(this._heldNotes.set(e,{time:t,velocity:n}),this._notes.start(e,t,n))),this}},{key:"keyUp",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:l.default.now(),n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:.8;if(this.loaded&&(t=this.toSeconds(t),l.default.isString(e)&&(e=Math.round((0,s.Frequency)(e).toMidi())),this._heldNotes.has(e))){var r=this._heldNotes.get(e);this._heldNotes.delete(e),this._release&&this._release.start(e,t,n);var o=t-r.time,i=r.velocity,u=.5/Math.max(o,.1)+i+n;u=Math.pow(Math.log(Math.max(u,1)),2)/2,this._pedal.isDown(t)?this._sustainedNotes.has(e)||this._sustainedNotes.set(e,t):(this._notes.stop(e,t,n),this._harmonics&&this._harmonics.start(e,t,u))}return this}},{key:"setVolume",value:function(e,t){switch(e){case"note":this._notes.volume=t;break;case"pedal":this._pedal.volume=t;break;case"release":this._release&&(this._release.volume=t);break;case"harmonics":this._harmonics&&(this._harmonics.volume=t)}return this}},{key:"stopAll",value:function(){var e=this;return this.pedalUp(),this._heldNotes.forEach(function(t,n){e.keyUp(n)}),this}},{key:"progress",value:function(e){return s.Buffer.on("progress",e),this}},{key:"loaded",get:function(){return this._loaded}}]),t}(s.AudioNode)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function u(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0});var a=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),s=n(3),l=r(s),c=n(1),f=(r(c),n(2)),p=n(0),h=(r(p),function(e){function t(){o(this,t);var e=i(this,(t.__proto__||Object.getPrototypeOf(t)).call(this));return e._downTime=1/0,e._currentSound=null,e._buffers=null,e}return u(t,e),a(t,[{key:"load",value:function(e){var t=this;return new Promise(function(n){t._buffers=new p.Buffers({up:"pedalU1.mp3",down:"pedalD1.mp3"},n,e)})}},{key:"_squash",value:function(e){this._currentSound&&this._currentSound.stop(e+.1,.1),this._currentSound=null}},{key:"_playSample",value:function(e,t){this._currentSound=(0,f.createSource)(this._buffers.get(t)),this._currentSound.curve="exponential",this._currentSound.connect(this.output).start(e,(0,f.randomBetween)(0,.01),void 0,.5*(0,f.randomBetween)(.5,1),.05)}},{key:"down",value:function(e){this._squash(e),this._downTime=e,this._playSample(e,"down")}},{key:"up",value:function(e){this._squash(e),this._downTime=1/0,this._playSample(e,"up")}},{key:"isDown",value:function(e){return e>this._downTime}}]),t}(l.default));t.default=h},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function u(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0}),t.Notes=void 0;var a=function(){function e(e,t){var n=[],r=!0,o=!1,i=void 0;try{for(var u,a=e[Symbol.iterator]();!(r=(u=a.next()).done)&&(n.push(u.value),!t||n.length!==t);r=!0);}catch(e){o=!0,i=e}finally{try{!r&&a.return&&a.return()}finally{if(o)throw i}}return n}return function(t,n){if(Array.isArray(t))return t;if(Symbol.iterator in Object(t))return e(t,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),s=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),l=n(0),c=(r(l),n(1)),f=r(c),p=n(3),h=r(p),d=n(2),_={1:[8],2:[6,12],3:[1,8,15],4:[1,5,10,15],5:[1,4,8,12,16],6:[1,3,7,10,13,16],7:[1,3,6,9,11,13,16],8:[1,3,5,7,9,11,13,15],9:[1,3,5,7,9,11,13,15,16],10:[1,2,3,5,7,9,11,13,15,16],11:[1,2,3,5,7,9,11,13,14,15,16],12:[1,2,3,4,5,7,9,11,13,14,15,16],13:[1,2,3,4,5,7,9,11,12,13,14,15,16],14:[1,2,3,4,5,6,7,9,11,12,13,14,15,16],15:[1,2,3,4,5,6,7,9,10,11,12,13,14,15,16],16:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]},y=[21,24,27,30,33,36,39,42,45,48,51,54,57,60,63,66,69,72,75,78,81,84,87,90,93,96,99,102,105,108];t.Notes=function(e){function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[21,108],n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:1;o(this,t);var r=i(this,(t.__proto__||Object.getPrototypeOf(t)).call(this)),u=y.findIndex(function(t){return t>=e[0]}),a=y.findIndex(function(t){return t>=e[1]});a=-1===a?a=y.length:a+1;var s=y.slice(u,a);return r._samplers=_[n].slice(),r._activeNotes=new Map,r._samplers.forEach(function(e,t){r._samplers[t]={},s.forEach(function(n){r._samplers[t][n]=f.default.getNotesUrl(n,e)})}),r}return u(t,e),s(t,[{key:"_hasNote",value:function(e,t){return this._samplers.hasOwnProperty(t)&&this._samplers[t].has(e)}},{key:"_getNote",value:function(e,t){return this._samplers[t].get(e)}},{key:"stop",value:function(e,t,n){this._activeNotes.has(e)&&(this._activeNotes.get(e).forEach(function(e){e.stop(t+1,1)}),this._activeNotes.delete(e))}},{key:"start",value:function(e,t,n){var r=n*(this._samplers.length-1),o=Math.round(r),i=o-r,u=1-.5*i;1===this._samplers.length&&(u=n);var s=(0,d.midiToFrequencyRatio)(e),l=a(s,2),c=l[0],f=l[1];if(this._hasNote(c,o)){var p=(0,d.createSource)(this._getNote(c,o));p.playbackRate.value=f,p.connect(this.output),p.curve="exponential",p.start(t,0,void 0,u,0),this._activeNotes.has(e)||this._activeNotes.set(e,[]),this._activeNotes.get(e).push(p)}}},{key:"load",value:function(e){var t=this,n=[];return this._samplers.forEach(function(r,o){var i=new Promise(function(n){t._samplers[o]=new l.Buffers(r,n,e)});n.push(i)}),Promise.all(n)}}]),t}(h.default)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function u(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0});var a=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),s=n(1),l=r(s),c=n(3),f=r(c),p=n(2),h=n(0),d=[21,24,27,30,33,36,39,42,45,48,51,54,57,60,63,66,69,72,75,78,81,84,87],_=function(e){function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[21,108];o(this,t);var n=i(this,(t.__proto__||Object.getPrototypeOf(t)).call(this)),r=d.findIndex(function(t){return t>=e[0]}),u=d.findIndex(function(t){return t>=e[1]});u=-1===u?u=d.length:u;var a=d.slice(r,u);n._samples={};var s=!0,c=!1,f=void 0;try{for(var p,h=a[Symbol.iterator]();!(s=(p=h.next()).done);s=!0){var _=p.value;n._samples[_]=l.default.getHarmonicsUrl(_)}}catch(e){c=!0,f=e}finally{try{!s&&h.return&&h.return()}finally{if(c)throw f}}return n}return u(t,e),a(t,[{key:"start",value:function(e,t,n){e>=d[0]&&e<=d[d.length-1]&&this._sampler.triggerAttack((0,p.midiToNote)(e),t,n*(0,p.randomBetween)(.5,1))}},{key:"load",value:function(e){var t=this;return new Promise(function(n,r){t._sampler=new h.Sampler(t._samples,n,e).connect(t.output),t._sampler.release=1})}}]),t}(f.default);t.default=_},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function u(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0});var a=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),s=n(1),l=r(s),c=n(3),f=r(c),p=n(2),h=n(0),d=function(e){function t(e){o(this,t);var n=i(this,(t.__proto__||Object.getPrototypeOf(t)).call(this));n._buffers={};for(var r=e[0];r<=e[1];r++)n._buffers[r]=l.default.getReleasesUrl(r);return n}return u(t,e),a(t,[{key:"load",value:function(e){var t=this;return new Promise(function(n){t._buffers=new h.Buffers(t._buffers,n,e)})}},{key:"start",value:function(e,t,n){if(this._buffers.has(e)){var r=(0,p.createSource)(this._buffers.get(e)).connect(this.output);n*=(0,p.randomBetween)(.5,1),r.start(t,0,void 0,.015*n,0)}}}]),t}(f.default);t.default=d}])});
//# sourceMappingURL=Piano.js.map