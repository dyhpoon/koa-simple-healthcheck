"use strict";

var request = require("supertest");
var sinon = require("sinon");
var should = require("should");
var Koa = require("koa");

var healthcheck = require("..");

describe("koa-simple-healthcheck", function() {
  var app;
  var uptime = 100;

  beforeEach(function() {
    app = App();

    // mock uptime
    sinon.stub(process, "uptime").returns(uptime);
  });

  afterEach(function() {
    process.uptime.restore();
  });

  it("exports a function", function() {
    healthcheck.should.be.an.instanceof(Function);
  });

  it("returns a middleware", function() {
    healthcheck().should.be.an.instanceOf(Function);
  });

  describe("middleware", function() {
    it("should throw error (`test` method)", function() {
      should(function() {
        app.use(healthcheck({
          test: 'error'
        }))
      }).throwError()
    });

    it("should throw error (`healthy` method)", function() {
      should(function() {
        app.use(healthcheck({
          healthy: 'error'
        }))
      }).throwError()
    });

    it("responds with json", function(done) {
      app.use(healthcheck());

      request(app.listen())
        .get("/healthcheck")
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .expect({ uptime }, done);
    });

    it("responds with other route", function(done) {
      app.use(
        healthcheck({
          path: "/ping"
        })
      );

      request(app.listen())
        .get("/ping")
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .expect({ uptime }, done);
    });
  });

  describe("`test` method", function() {
    it("responds with 200 for falsy return value", function(done) {
      app.use(
        healthcheck({
          test: function() {
            return;
          }
        })
      );

      request(app.listen())
        .get("/healthcheck")
        .expect(200)
        .expect({ uptime }, done);
    });
    it("responds with 500 for truthy return values", function(done) {
      app.use(
        healthcheck({
          test: function() {
            return true;
          }
        })
      );

      request(app.listen())
        .get("/healthcheck")
        .expect('Content-Type', /application\/json/)
        .expect(500, done);
    });
    it("responds with return value as body for truthy return values", function(done) {
      const badError = { error: true };
      app.use(
        healthcheck({
          test: function() {
            return badError;
          }
        })
      );
      request(app.listen())
        .get("/healthcheck")
        .expect('Content-Type', /application\/json/)
        .expect(500)
        .expect(badError, done);
    });
  });

  describe("when taking a callback", function() {
    it("responds with 200 for falsy callback values", function(done) {
      app.use(
        healthcheck({
          test: function(callback) {
            callback();
          }
        })
      );
      request(app.listen())
        .get("/healthcheck")
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .expect({ uptime }, done);
    });

    it("responds with 500 for truthy callback values", function(done) {
      app.use(
        healthcheck({
          test: function(callback) {
            callback(true);
          }
        })
      );
      request(app.listen())
        .get("/healthcheck")
        .expect('Content-Type', /application\/json/)
        .expect(500)
        .expect("true", done);
    });

    it("responds with return value as body for truthy return values", function(done) {
      const badError = { error: true };
      app.use(
        healthcheck({
          test: function(callback) {
            callback(badError);
          }
        })
      );
      request(app.listen())
        .get("/healthcheck")
        .expect('Content-Type', /application\/json/)
        .expect(500)
        .expect(badError, done);
    });
  });

  describe("when throwing", function() {
    it("responds with 200 if no error thrown", function(done) {
      app.use(
        healthcheck({
          test: function() {}
        })
      );
      request(app.listen())
        .get("/healthcheck")
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .expect({ uptime }, done);
    });

    it("responds with 500 for truthy callback values", function(done) {
      app.use(
        healthcheck({
          test: function(callback) {
            callback(new Error("An error"))
          }
        })
      );
      request(app.listen())
        .get("/healthcheck")
        .expect('Content-Type', /application\/json/)
        .expect(500)
        .expect({}, done);
    });

    it("responds with return value as body for truthy return values", function(done) {
      app.use(
        healthcheck({
          test: function() {
            throw new Error("An error");
          }
        })
      );
      request(app.listen())
        .get("/healthcheck")
        .expect('Content-Type', /application\/json/)
        .expect(500)
        .expect({}, done);
    });
  });

  describe("`healthy` method", function() {
    it("responds with return value of method as response body", function(done) {
      app.use(
        healthcheck({
          healthy: function() {
            return { everything: "is ok" };
          }
        })
      );

      request(app.listen())
        .get("/healthcheck")
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .expect({ everything: "is ok" }, done);
    });
  });
});

function App(options) {
  var app = new Koa();
  return app;
}
