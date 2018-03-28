# koa-simple-healthcheck
simple healthcheck middleware for koa. Inspired by [express-healthcheck](https://github.com/lennym/express-healthcheck).


## Installation

```
npm install koa-simple-healthcheck
```

## Usage

```
app.use(require('koa-simple-healthcheck')());
```

This will respond with a JSON payload of `{ "uptime": [uptime in seconds] }` and a 200 status code.

The healthy response can be customised by passing in a custom `healthy` method.

```
app.use(require('koa-simple-healthcheck')({
    healthy: function () {
        return { everything: 'is ok' };
    }
}));

// curl localhost:3000/healthcheck
```

To use a different route, you can set it with a `path` property. (default is `/healthcheck`)

```
app.use(require('koa-simple-healthcheck')({
    path: '/ping',
    healthy: function () {
        return { everything: 'is ok' };
    },
}))

// curl localhost:3000/ping
```

You can optionally provide a test method which will be executed to establish the health of the application.

This function can either throw, return an error, or call a callback with an error. Functions with an arity of 0 will expect a return, functions with an arity of 1 will expect a callback.

```
app.use(require('koa-simple-healthcheck')({
    test: function () {
        throw new Error('Application is not running');
    }
}));
```

```
app.use(require('koa-simple-healthcheck')({
    test: function () {
        return { state: 'unhealthy' };
    }
}));
```

```
app.use(require('koa-simple-healthcheck')({
    test: function (callback) {
        callback({ state: 'unhealthy' });
    }
}));
```
