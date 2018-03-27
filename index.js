'use strict'

const DEFAULT_PATH = '/healthcheck'

module.exports = function(options) {
  options = options || {}

  // set path
  options.path = options.path || DEFAULT_PATH

  // set healthy function
  options.healthy = options.healthy || function() {
    return { uptime: process.uptime() }
  }
  if (typeof options.healthy !== 'function') {
    throw new Error('koa-simple-healthcheck `healthy` method must be a function')
  }

  // set test function
  options.test = options.test || function() {}
  if (typeof options.test !== 'function') {
    throw new Error('koa-simple-healthcheck `test` method must be a function')
  }
  if (options.test.length === 0) {
    const test = options.test;
    options.test = function (callback) {
      callback(test());
    };
  }

  return async function healthcheck(ctx, next) {
    if (options.path != ctx.path) return await next()

    try {
      options.test(function(err) {
        var status, response
        if (err) {
          status = 500
          response = err
        } else {
          status = 200
          response = options.healthy()
        }
        jsonlize(ctx, status, response)
      })
    } catch (err) {
      jsonlize(ctx, 500, err)
    }
  }
}

/**
 * Stringify JSON, and set status code, body, type to context
 *
 * @param {Object} ctx
 * @param {number} status
 * @param {*} value
 * @returns {void}
 * @private
 */
function jsonlize(ctx, status, val) {
  ctx.status = status
  ctx.type = 'application/json'
  ctx.body = JSON.stringify(val)
}
