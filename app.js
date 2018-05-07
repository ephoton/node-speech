
const Path = require('path');
const Fs = require('fs');
const Process = require('process');
const Koa = require('koa');
const Hbs = require('koa-hbs');
const StaticCache = require('koa-static-cache');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');


const app = new Koa();
const router = new Router();

app.use(bodyParser());
app.use(Hbs.middleware({
  viewPath: Path.resolve(__dirname, './view'),
  extname: '.html'
}));

app.use(StaticCache(Path.resolve(__dirname, './static')));

router.get('/', (ctx, next) => {
  return ctx.render('index', {});
});

router.post('/upload', (ctx, next) => {
  const { data } = ctx.request.body;

  console.log('get data: ', data);
  
  return ctx.body = 'upload';
});

app.use(router.routes())
  .use(router.allowedMethods());

app.on('error', (err, ctx) => {
  throw new Error(err);
});

app.listen(3000);
