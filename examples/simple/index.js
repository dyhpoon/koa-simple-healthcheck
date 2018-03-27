const Koa = require('koa')
const app = new Koa()

app.use(require('../..')({
  path: '/ping',
  test: function() {
    return { state: 'unhealthy' };
  }
}))

app.listen(3000)
