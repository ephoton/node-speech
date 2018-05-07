var audio = require('audio-stream');
var pcm = require('pcm-stream');
var wave = require('./wave-stream');

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
	}, 500);

	if(sourceStream) {
		sourceStream.restart();
	} else {
		getUserMedia.call(navigator, {
			video: false,
			audio: true
		}, function(result) {
			var w = wave();

			mediaStream = window.ms = result;
			sourceStream = audio(mediaStream, { volume: 1 });

			sourceStream
				.on('header', function(header) {
					var channels = header.channels;
					var sampleRate = header.sampleRate;

					w.setHeader({
						audioFormat: 1,
						channels: channels,
						sampleRate: sampleRate,
						byteRate: sampleRate * channels * 2,
						blockAlign: channels * 2,
						bitDepth: 16
					});
                })
                .on('data', function() {

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
});

stop.addEventListener('click', function() {
	pause.setAttribute('disabled', 'disabled');
	stop.setAttribute('disabled', 'disabled');

	mediaStream.getAudioTracks().forEach(function(track) {
		track.stop();
	});
});
