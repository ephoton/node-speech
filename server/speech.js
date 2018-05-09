const Path = require('path');
const grpc = require('grpc');
const PROTO_PATH = Path.resolve(__dirname, './speech.proto');

const speech_proto = grpc.load(PROTO_PATH).speech;

function speech(onData, onEnd) {
  const client = new speech_proto.Streaming('10.8.0.170:1212', grpc.credentials.createInsecure());
  const call = client.Speech();
  
  console.log('speech init.');
  call.on('data', function(res) {
    onData(res);
  });
  
  call.on('error', function(err) {
    console.log('eror in call: ', err);
  });
  call.on('status', function(status) {
    console.log('status in call: ', status);
  });
  
  call.on('end', function(res) {
    onEnd(res);
  });

  return function (data) {
    call.write(data);
  };
}

exports.speech = speech;
