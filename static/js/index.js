var audio = require('audio-stream');
var pcm = require('pcm-stream');
var wave = require('./wave-stream');
// var trans = require('./trans');

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

var getUserMedia = navigator.getUserMedia ||
	navigator.webkitGetUserMedia ||
	navigator.mozGetUserMedia;

var pad = function(n) {
	return n < 10 ? ('0' + n) : n;
};

var mediaStream = null;
var sourceStream = null;

var record = document.getElementById('record-button');
var pause = document.getElementById('pause-button');
var stop = document.getElementById('stop-button');
var duration = document.getElementById('duration');
// var volume = document.getElementById('volume');

var player = document.getElementById('player');
var download = document.getElementById('download');

// var l16stream = new trans({ writableObjectMode: true });

// l16stream.on('data', function(data) {
// 	console.log('data in l16stream: ', data);
// });

record.addEventListener('click', function() {
	// volume.setAttribute('disabled', 'disabled');
	record.setAttribute('disabled', 'disabled');
	pause.removeAttribute('disabled');
	stop.removeAttribute('disabled');

	setInterval(function() {
		if(sourceStream) {
			var seconds = Math.floor(sourceStream.duration);
			var minutes = Math.floor(seconds / 60);

			duration.innerHTML = pad(minutes) + ':' + pad(seconds - minutes * 60);
		}
	}, 200);

	if(sourceStream) {
		sourceStream.restart();
	} else {
		getUserMedia.call(navigator, {
			video: false,
			audio: true
		}, function(result) {
			var w = wave();

			mediaStream = window.ms = result;
			sourceStream = audio(mediaStream, {
				volume: 1,
				channels: 1
			});

			sourceStream
				.on('header', function(header) {
					// var channels = header.channels;
					// var sampleRate = header.sampleRate;
					var channels = 1;
					var sampleRate = 16000;

					console.log('channel and sampleRate in header: ', sampleRate, channels);
					w.setHeader({
						audioFormat: 1,
						channels: channels,
						sampleRate: sampleRate,
						byteRate: sampleRate * channels * 2,
						blockAlign: channels * 2,
						bitDepth: 16
					});
				})
				.on('data', function(data) {
					function buf2hex(buffer) { // buffer is an ArrayBuffer
						return Array.prototype.map.call(new Uint16Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
					}

					// const emitData = new TextDecoder("utf-8").decode(data, {
					// 	stream: true
					// });
					const emitData = buf2hex(data.buffer);

					console.log('emitData: ', emitData);
					socket.emit('request', {
						data: emitData,
						end: false
					});
				})
				.pipe(pcm())
				.pipe(w)
				.on('url', function(url) {
					player.src = url;
					download.href = url;
					// download.classList.remove('hidden');
				});
		}, function(err) {
			console.error(err);
		});
	}
});

pause.addEventListener('click', function() {
	record.removeAttribute('disabled');
	pause.setAttribute('disabled', 'disabled');
	sourceStream.suspend();

	socket.emit('request', {
		data: '',
		end: true
	});
});

stop.addEventListener('click', function() {
	pause.setAttribute('disabled', 'disabled');
	stop.setAttribute('disabled', 'disabled');
	
	mediaStream.getAudioTracks().forEach(function(track) {
		track.stop();
	});

	socket.emit('request', {
		data: '',
		end: true
	});
});
