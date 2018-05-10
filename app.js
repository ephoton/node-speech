
const Path = require('path');
const Fs = require('fs');
const Process = require('process');
const Koa = require('koa');
const Hbs = require('koa-hbs');
const StaticCache = require('koa-static-cache');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const protobuf = require("protobufjs");
const ByteBuffer = require("bytebuffer");
const Samplerate = require("node-samplerate");;
const pcm = require('pcm-util')

const originalSamplerate = 44100;
const channels = 1;
const targetSamplerate = 16000;

const { speech } = require('./server/speech.js');

const app = new Koa();
const router = new Router();
const server = require('http').createServer(app.callback());
const io = require('socket.io')(server);
const speechResponse = [];
let caller;

function toByteArray(hexString) {
  var result = [];
  while (hexString.length >= 2) {
    result.push(parseInt(hexString.substring(0, 2), 16));
    hexString = hexString.substring(2, hexString.length);
  }
  return result;
}

io.on('connection', function(socket) {
  socket.on('request', function(req) {
    if (!caller) {
      caller = speech(res => {
        console.log('res in data callback: ', res);

        if (res && !res.end_vad) {
          socket.emit('response', res.result);
        }
      }, res => {
        console.log('call ended: ', res);
      });
    }
          
    if (req) {
      
      // console.log('filterData in server: ', filterData, buffer.toString('utf16le').length, filterData.toString('utf16le').length);

      // const data = Uint16Array.from(buffer);
      // console.log('req.data: ', typeof req.data, req.data);
      
      // const formatBuffer = pcm.convert(req.data, {
      //   channels: 1,
      //   sampleRate: 44100,
      //   // samplesPerFrame: 2048,
      //   // byteOrder: 'BE'
      // }, {
      //   channels: 1,
      //   sampleRate: 16000,
      //   // samplesPerFrame: 1024,
      //   // byteOrder: 'LE'
      // });

      // const buffer = bytes.toBuffer();
      // const filterData = Samplerate.resample(buffer, originalSamplerate, targetSamplerate, channels);
    
      // console.log('buffer vs filterData: ', bytes.length, buffer.length);
      // console.log('req data: ', req.data);
      const bytes = new ByteBuffer.fromHex(req.data);
      
      const byteArray = toByteArray(req.data);
      // console.log('byteArray: ', byteArray);
      const queryData = {
        // data: new Buffer(req.data),
        data: bytes.toBuffer(),
        eof: req.end ? 1 : 0,
        deviceId: 'ephotons test',
        audio_type: 'pcm'
      };
      caller(queryData);
    }
  });
});

app.use(bodyParser());
app.use(Hbs.middleware({
  viewPath: Path.resolve(__dirname, './view'),
  extname: '.html'
}));

app.use(StaticCache(Path.resolve(__dirname, './static')));

router.get('/', (ctx, next) => {
  return ctx.render('index', {});
});

router.get('/test', (ctx, next) => {
  return ctx.render('test', {});
});

app.use(router.routes())
  .use(router.allowedMethods());

app.on('error', (err, ctx) => {
  throw new Error(err);
});

server.listen(3000);
