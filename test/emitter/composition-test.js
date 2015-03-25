define([
  "buster",
  "../../emitter/composition",
  "../../config"
], function (buster, Emitter, config) {
  "use strict";

  var assert = buster.referee.assert;
  var refute = buster.referee.refute;

  var TYPE = config.emitter.type;
  var CALLBACK = config.emitter.callback;
  var SCOPE = config.emitter.scope;
  var LIMIT = config.emitter.limit;

  buster.testCase("troopjs-core/emitter/composition", {
    "emit": function () {
      var emitter = new Emitter();
      var callback = this.spy();

      emitter.on("test", callback);

      return emitter
        .emit("test", "test")
        .tap(function () {
          assert.calledOnce(callback);
          assert.calledWith(callback, "test");

          return emitter
            .emit("test", "one", "two", "three")
            .tap(function () {
              assert.calledTwice(callback);
              assert.calledWith(callback, "one", "two", "three");
            });
        });
    },

    "emit with scope": function () {
      var emitter = new Emitter();
      var scope1 = {};
      var scope2 = {};
      var callback;
      var callback1 = this.spy();
      var callback2 = this.spy();

      callback = {};
      callback[SCOPE] = scope1;
      callback[CALLBACK] = callback1;
      emitter.on("test", callback);

      callback = {};
      callback[SCOPE] = scope2;
      callback[CALLBACK] = callback2;
      emitter.on("test", callback);

      return emitter
        .emit("test")
        .tap(function () {
          assert.calledOnce(callback1);
          assert.calledOn(callback1, scope1);
          assert.calledOnce(callback2);
          assert.calledOn(callback2, scope2);
        });
    },

    "emit with scope filtering": function () {
      var emitter = new Emitter();
      var scope1 = {};
      var scope2 = {};
      var event;
      var callback;
      var callback1 = this.spy();

      callback = {};
      callback[SCOPE] = scope1;
      callback[CALLBACK] = callback1;
      emitter.on("test", callback);

      callback = {};
      callback[SCOPE] = scope2;
      callback[CALLBACK] = callback1;
      emitter.on("test", callback);

      event = {};
      event[TYPE] = "test";
      event[SCOPE] = scope1;

      return emitter
        .emit(event)
        .tap(function () {
          assert.calledOnce(callback1);

          event = {};
          event[TYPE] = "test";
          event[SCOPE] = scope2;

          return emitter
            .emit(event)
            .tap(function () {
              assert.calledTwice(callback1);
            });
        });
    },

    "emit with callback filtering": function () {
      var emitter = new Emitter();
      var event;
      var callback1 = this.spy();
      var callback2 = this.spy();

      emitter.on("test", callback1);
      emitter.on("test", callback2);

      return emitter
        .emit("test")
        .tap(function () {
          assert.calledOnce(callback1);
          assert.calledOnce(callback2);

          event = {};
          event[TYPE] = "test";
          event[CALLBACK] = callback1;

          return emitter
            .emit(event)
            .tap(function () {
              assert.calledTwice(callback1);
              assert.calledOnce(callback2);

              event = {};
              event[TYPE] = "test";
              event[CALLBACK] = callback2;

              return emitter
                .emit(event)
                .tap(function () {
                  assert.calledTwice(callback1);
                  assert.calledTwice(callback2);
                });
            });
        });
    },

    "off with scope filtering": function () {
      var emitter = new Emitter();
      var scope1 = {};
      var scope2 = {};
      var callback;
      var callback1 = this.spy();

      callback = {};
      callback[SCOPE] = scope1;
      callback[CALLBACK] = callback1;
      emitter.on("test", callback);

      callback = {};
      callback[SCOPE] = scope2;
      callback[CALLBACK] = callback1;
      emitter.on("test", callback);

      return emitter
        .emit("test")
        .tap(function () {
          assert.calledTwice(callback1);

          callback = {};
          callback[SCOPE] = scope2;
          emitter.off("test", callback);

          return emitter
            .emit("test")
            .tap(function () {
              assert.calledThrice(callback1);
            });
        });
    },

    "emit reject": function () {
      var emitter = new Emitter();
      var callback1 = this.spy(function (pass) {
        if (pass !== true) {
          throw new Error("test");
        }

        return pass;
      });
      var callback2 = this.spy();
      var resolved = this.spy();
      var rejected = this.spy();

      emitter.on("test", callback1);
      emitter.on("test", callback2);

      return emitter
        .emit("test", false)
        .then(resolved, rejected)
        .ensure(function () {
          assert.calledOnce(callback1);
          refute.called(callback2);
          assert.called(rejected);
          refute.called(resolved);
          assert.threw(callback1);

          return emitter
            .emit("test", true)
            .tap(function () {
              assert.calledTwice(callback1);
              assert.calledOnce(callback2);
            });
        });
    },

    "limit - one": function () {
      var emitter = new Emitter();
      var callback = this.spy();

      emitter.one("test", callback);

      return emitter
        .emit("test")
        .tap(function () {
          return emitter
            .emit("test")
            .tap(function () {
              assert.calledOnce(callback);
            });
        });
    },

    "limit - many": function () {
      var emitter = new Emitter();
      var callback = this.spy();
      var event = {};

      event[CALLBACK] = callback;
      event[LIMIT] = 2;

      emitter.on("test", event);

      return emitter
        .emit("test")
        .tap(function () {
          return emitter
            .emit("test")
            .tap(function () {
              return emitter
                .emit("test")
                .tap(function () {
                  assert.calledTwice(callback);
                });
            });
        });
    }
  });
});
