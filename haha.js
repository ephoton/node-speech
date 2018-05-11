var mic = require('mic');
var fs = require('fs');
const { speech } = require('./server/speech.js');

var micInstance = mic();
var micInputStream = micInstance.getAudioStream();
 
var outputFileStream = fs.WriteStream('output.raw');

micInputStream.pipe(outputFileStream);
let caller;
 
micInputStream.on('data', function(data) {
    console.log("Recieved Input Stream: " + data.length, data);
    
    if (!caller) {
        caller = speech(res => {
          console.log('res in data callback: ', res);
  
          if (res && !res.end_vad) {
            console.log('response', res.result);
          }
        }, res => {
          console.log('call ended: ', res);
        });
      }

    const queryData = {
        // data: new Buffer(req.data),
        data: data,
        eof: 0,
        deviceId: 'ephotons test',
        audio_type: 'pcm'
    };

    caller(queryData);
});
 
micInputStream.on('error', function(err) {
    cosole.log("Error in Input Stream: " + err);
});

micInstance.start();
