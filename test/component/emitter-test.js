define([
  "buster",
  "../../component/emitter",
  "../../component/signal/start",
  "../../component/signal/finalize",
  "when/delay"
], function (buster, Component, start, finalize, delay) {
  "use strict";

  var assert = buster.referee.assert;
  var refute = buster.referee.refute;

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

    "initial phase is undefined": function () {
      var component = Component.create();

      assert(component.hasOwnProperty("phase"));
      refute.defined(component.phase);
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

    "bug out in sig/initialize": function () {
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

    "bug out in sig/task": function () {
      var err = new Error("bug out");
      return Component.create({
        "sig/task": function () {
          throw err;
        }
      }).task(delay(100)).otherwise(function (error) {
        assert.same(error, err);
      });
    },

    "event handlers - setup/add/added/remove/removed/teardown": function () {
      var handlers;
      var FOO = "foo";
      var setup = this.spy();
      var add = this.spy();
      var added = this.spy();
      var remove = this.spy();
      var removed = this.spy();
      var teardown = this.spy();
      var foo = Component.create({
        "displayName": FOO,
        "sig/setup": setup,
        "sig/add": add,
        "sig/added": added,
        "sig/remove": remove,
        "sig/removed": removed,
        "sig/teardown": teardown
      });

      function callback1 () {}
      function callback2 () {}

      var handler1 = foo.on(FOO, callback1, 1);
      var handler2 = foo.on(FOO, callback2, 2);
      foo.off(FOO, callback1, 11);
      foo.off(FOO, callback2, 22);

      handlers = foo.handlers[FOO];

      assert.calledOnce(setup);
      assert.calledTwice(add);
      assert.calledTwice(added);
      assert.calledTwice(remove);
      assert.calledTwice(removed);
      assert.calledOnce(teardown);

      assert.calledWith(setup, handlers, FOO, callback1, 1);
      assert.calledWith(add, handlers, FOO, callback1, 1);
      assert.calledWith(add, handlers, FOO, callback2, 2);
      assert.calledWith(added, handlers, handler1, FOO, callback1, 1);
      assert.calledWith(added, handlers, handler2, FOO, callback2, 2);
      assert.calledWith(remove, handlers, FOO, callback1, 11);
      assert.calledWith(remove, handlers, FOO, callback2, 22);
      assert.calledWith(removed, handlers, handler1, FOO, callback1, 11);
      assert.calledWith(removed, handlers, handler2, FOO, callback2, 22);
      assert.calledWith(teardown, handlers, FOO, callback2, 22);
    },

    "event handlers - setup - prevent add": function () {
      var setup = this.spy(function () {
        return false;
      });
      var add = this.spy();

      var component = Component.create({
        "sig/setup": setup,
        "sig/add": add
      });

      component.on("foo", function () {});

      assert.calledOnce(setup);
      refute.called(add);
    },

    "event handlers - added - prevent added": function () {
      var add = this.spy(function () {
        return false;
      });
      var added = this.spy();

      var component = Component.create({
        "sig/add": add,
        "sig/added": added
      });

      component.on("foo", function () {});

      assert.calledOnce(add);
      refute.called(added);
    },

    "event handlers - remove - prevent teardown": function () {
      var remove = this.spy(function () {
        return false;
      });
      var teardown = this.spy();
      var handler = this.spy();

      var component = Component.create({
        "sig/teardown": teardown,
        "sig/remove": remove
      });

      component.on("foo", handler);
      component.off("foo", handler);

      assert.calledOnce(remove);
      refute.called(teardown);
    },

    "event handlers - teardown - prevent removed": function () {
      var teardown = this.spy(function () {
        return false;
      });
      var removed = this.spy();
      var handler = this.spy();

      var component = Component.create({
        "sig/teardown": teardown,
        "sig/removed": removed
      });

      component.on("foo", handler);
      component.off("foo", handler);

      assert.calledOnce(teardown);
      refute.called(removed);
    }
  });
});
