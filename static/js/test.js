var getUserMedia = require('get-user-media-promise');
var MicrophoneStream = require('microphone-stream');

var pcm = require('pcm-util');
var AudioContext = window.AudioContext || window.webkitAudioContext;
var Trans = require('./trans');

var io = require('socket.io-client');
var socket = io('http://localhost:3000');

socket.on('connect', function() {
	console.log('socket connect.');
});
socket.on('event', function(data) {
	console.log('connect event: ', data);
});
socket.on('disconnect', function() {
	console.log('socket disconnect.');
});

socket.on('response', function(data) {
	// console.log('response data: ', data);
	console.log('response: ', data);
});

const record = document.getElementById('record-test');
const stop = document.getElementById('stop-test');
const duration = document.getElementById('duration');
const player = document.getElementById('player');
const audioBox = document.getElementById('audio-box');

// let oscillator = context.createOscillator()
// oscillator.type = 'sawtooth'
// oscillator.frequency.value = 440
// oscillator.start()
 
// //pipe oscillator audio data to stream
// Readable(oscillator).on('data', (audioBuffer) => {
//     console.log('oscillator data: ', audioBuffer.getChannelData(0))
// })

// Generator(time => Math.sin(Math.PI * 2 * time * 440))
// .pipe(Writable(context.destination))
 
var mediaConstraints = {
  audio: true,
  video: true
};

function buf2hex(buffer) { // buffer is an ArrayBuffer
  return Array.prototype.map.call(buffer, function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
}

var micStream = new MicrophoneStream({
  bufferSize: 2048
});
var trans = new Trans();

record.addEventListener('click', function() {
 
  getUserMedia({ video: false, audio: true })
    .then(function(stream) {
      micStream.setStream(stream);
    }).catch(function(error) {
      console.log('error in getUserMedia: ', error);
    });
 
  // get Buffers (Essentially a Uint8Array DataView of the same Float32 values)
  micStream.on('data', function(chunk) {
    // Optionally convert the Buffer back into a Float32Array
    // (This actually just creates a new DataView - the underlying audio data is not copied or modified.)
    const raw = MicrophoneStream.toRaw(chunk)
    // const source = trans.downsample(chunk);
    const buffer = trans.floatTo16BitPCM(raw);
    //...
 
    // note: if you set options.objectMode=true, the `data` event will output AudioBuffers instead of Buffers
    console.log('chunk on data: ', chunk.length, typeof buffer, buffer.length, buffer);
    
    socket.emit('request', {
      data: buffer,
      end: false
    });
   });
 
  // or pipe it to another stream
  // micStream.pipe(/*...*/);
 
  // It also emits a format event with various details (frequency, channels, etc)
  micStream.on('format', function(format) {
    console.log('format: ', format);
  });
 
});

stop.addEventListener('click', function() {
  micStream.stop();
});
