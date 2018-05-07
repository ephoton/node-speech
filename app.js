
const Path = require('path');
const Fs = require('fs');
const Process = require('process');
const Koa = require('koa');
const Hbs = require('koa-hbs');
const StaticCache = require('koa-static-cache');

const app = new Koa();

app.use(Hbs.middleware({
  viewPath: Path.resolve(__dirname, './view'),
  extname: '.html'
}));

app.use(StaticCache(Path.resolve(__dirname, './static')));

app.use(async (ctx, next) => {
  await next();

  console.log('ctx url: ', ctx.url);
  return ctx.render('index', {});
});

app.on('error', (err, ctx) => {
  throw new Error(err);
});

app.listen(3000);
