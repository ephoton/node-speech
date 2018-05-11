const { Readable, Writable } = require('web-audio-stream/stream')
const context = require('audio-context')
const Generator = require('audio-generator');
var pcm = require('pcm-util');
var toBuffer = require('blob-to-buffer');
var AudioContext = window.AudioContext || window.webkitAudioContext;
var Trans = require('./trans');

const mic = require('mic');

const trans = new Trans({
  sourceSampleRate: 44100
});

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

var mediaConstraints = {
  audio: true
};

navigator.getUserMedia(mediaConstraints, onMediaSuccess, onMediaError);

const index = 0;

function buf2hex(buffer) { // buffer is an ArrayBuffer
  return Array.prototype.map.call(buffer, function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');}

function onMediaSuccess(stream) {
  var mediaRecorder = new MediaStreamRecorder(stream);
  mediaRecorder.mimeType = 'audio/wav'; // check this line for audio/pcm
  mediaRecorder.audioChannels = 1;
  mediaRecorder.sampleRate = 44100;
  // mediaRecorder.speed = 200;

  mediaRecorder.ondataavailable = function (blob) {
    // POST/PUT "Blob" using FormData/XHR2
    var blobURL = URL.createObjectURL(blob);
    let div = document.createElement('div');
    div.innerHTML = '<audio controls src="' + blobURL + '">' + blobURL + '</audio>';
    audioBox.appendChild(div);


    toBuffer(blob, function (err, buffer) {
      if (err) {
        console.log('error in toBuffer: ', err);
      }

      const source = trans.downsample(buffer); 
      const pcmData = trans.floatTo16BitPCM(source);   
    
      console.log('source in req: ', source);
      const reqData = buf2hex(pcmData);
      
      // console.log('reqData in req: ', reqData);
      socket.emit('request', {
        data: reqData,
        end: false
      });
    })
  };

  console.log('stream data: ', );

  record.addEventListener('click', function() {
    mediaRecorder.start(1000);

    // var ctx = new context({
    //   sampleRate: 48000,
    //   offline: true,
    //   length: 10000
    // });
    // var getSound = new XMLHttpRequest();
    // getSound.open("GET", "./media/test.wav", true);
    // getSound.responseType = "arraybuffer";
    // getSound.onload = function() {
    //   ctx.decodeAudioData(getSound.response, function(buffer){
    //     console.log('get audio buffer: ', buffer);
    //   });
    // }
    // getSound.send();
  });
  
  stop.addEventListener('click', function() {
    //
    mediaRecorder.save();
    mediaRecorder.stop();
  });

  // mediaRecorder.on('data', data => {
  //   console.log('mediaRecorder data: ', data);
  // }).on('end', () => {
  //   console.log('mediaRecorder ended.');
  // }).on('error', (err) => {
  //   console.log('mediaRecorder error: ', err);
  // })
}

function onMediaError(e) {
  console.error('media error', e);
}

