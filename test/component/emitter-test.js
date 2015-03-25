define([
  "buster",
  "../../component/emitter",
  "../../component/signal/start",
  "../../component/signal/finalize",
  "when/delay"
], function (buster, Component, start, finalize, delay) {
  "use strict";

  var assert = buster.referee.assert;
  var sinon = buster.sinon;

  var UNDEFINED;
  var PHASES = {
    "INITIAL": UNDEFINED,
    "INITIALIZE": "initialize",
    "STARTED": "started",
    "STOP": "stop",
    "FINALIZED": "finalized"
  };

  buster.testCase("troopjs-core/component/emitter", {
    "setUp": function () {
      this.timeout = 500;
    },

    "declarative - on": function () {
      var callback = this.spy(function () {
        return delay(200);
      });

      var Foo = Component.extend({
        "on/foo": callback
      });

      var Bar = Foo.extend({
        "on/foo": callback
      });

      var bar = Bar();

      return start.call(bar).then(function () {
        return bar.emit("foo", 123, "abc").then(function () {
          assert.calledTwice(callback);
          assert.calledWith(callback, 123, "abc");
        });
      });
    },

    "declarative - one": function () {
      var spy = this.spy();

      var foo = Component.create({
        "one/foo": spy
      });

      return start.call(foo).then(function () {
        return foo.emit("foo").then(function () {
          return foo.emit("foo").then(function () {
            assert.calledOnce(spy);
          });
        });
      });
    },

    "phase - match": function () {
      var foo = Component.create({
        "sig/start": function () {
          return delay(200);
        },
        "sig/finalize": function () {
          return delay(200);
        }
      });

      assert.equals(foo.phase, PHASES.INITIAL);

      return start.call(foo).then(function () {
        assert.equals(foo.phase, PHASES.STARTED);

        return finalize.call(foo).then(function () {
          assert.equals(foo.phase, PHASES.FINALIZED);
        });
      });
    },

    "bug out in first sig/initialize handler": function () {
      var err = new Error("bug out");
      var foo = Component.create({
        "sig/initialize": function () {
          throw err;
        }
      });
      return start.call(foo).otherwise(function (error) {
        assert.same(error, err);
      });
    },

    "bug out within task": function () {
      var err = new Error("bug out");
      return Component.create({
        "sig/task": function () {
          throw err;
        }
      }).task(delay(100)).otherwise(function (error) {
        assert.same(error, err);
      });
    },

    "event handlers - setup/add/remove/teardown": function () {
      var handlers;
      var FOO = "foo";
      var setup = this.spy();
      var add = this.spy();
      var remove = this.spy();
      var teardown = this.spy();
      var foo = Component.create({
        "displayName": FOO,
        "sig/setup": setup,
        "sig/add": add,
        "sig/remove": remove,
        "sig/teardown": teardown
      });

      function handler1 () {}
      function handler2 () {}

      foo.on(FOO, handler1);
      foo.on(FOO, handler2);
      foo.off(FOO, handler1);
      foo.off(FOO, handler2);

      handlers = foo.handlers[FOO];

      assert.calledOnce(setup);
      assert.calledTwice(add);
      assert.calledTwice(remove);
      assert.calledOnce(teardown);

      assert.calledWith(setup, handlers, FOO, handler1);
      assert.calledWith(add, handlers, FOO, handler1);
      assert.calledWith(add, handlers, FOO, handler2);
      assert.calledWith(remove, handlers, FOO, handler1);
      assert.calledWith(remove, handlers, FOO, handler2);
      assert.calledWith(teardown, handlers, FOO, handler2);
    },

    "event handlers - add - prevent default": function () {
      var evt = "bar";
      var eventData = {};
      var add = this.spy();
      var bar = Component.extend({
        "sig/add": function () {
          assert(false);
        }
      }).create({
        "sig/add": function () {
          add.apply(add, arguments);
          return false;
        }
      });

      function handler () {
        assert(false);
      }

      bar.on(evt, handler, eventData);
      assert.calledOnce(add);
      assert.calledWith(add, sinon.match.any, evt, handler, eventData);

      return bar.emit(evt);
    },

    "event handlers - remove - prevent default": function () {
      var evt = "bar";
      var handle = this.spy();
      var off = this.spy();
      var bar = Component.extend({
        "sig/remove": function () {
          assert(false);
        }
      }).create({
        "sig/remove": function () {
          off.apply(off, arguments);
          return false;
        }
      });

      function handler () {
        handle();
      }

      bar.on(evt, handler);
      bar.off(evt, handler);
      assert.calledOnce(off);
      assert.calledWith(off, sinon.match.any, evt, handler);
      return bar.emit(evt).then(function () {
        assert.calledOnce(handle);
      });
    }
  });
});
