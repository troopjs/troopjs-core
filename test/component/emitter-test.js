define([
	"../../component/emitter",
	"../../component/signal/start",
	"../../component/signal/finalize",
	"when/delay"
], function (Component, start, finalize, delay) {
	"use strict";

	var assert = buster.referee.assert;
	var sinon = buster.sinon;

	var PHASES = {
		"INITIAL": undefined,
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
			var count = 0;

			function onEvent(arg1, arg2) {
				count++;
				assert.equals(arg1, 123);
				assert.equals(arg2, "abc");
				return delay(200);
			}

			var Foo = Component.extend({
				"on/foo": onEvent
			});

			var Bar = Foo.extend({
				"on/foo": onEvent
			});

			var bar = Bar();

			return start.call(bar).then(function () {
				return bar.emit("foo", 123, "abc").then(function () {
					assert.equals(count, 2);
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
				"sig/start": function() {
					return delay(200);
				},
				"sig/finalize": function() {
					return delay(200);
				}
			});

			assert.equals(foo.phase, PHASES.INITIAL);

			return start.call(foo).then(function() {
				assert.equals(foo.phase, PHASES.STARTED);

				return finalize.call(foo).then(function() {
					assert.equals(foo.phase, PHASES.FINALIZED);
				});
			});
		},

		"bug out in first sig/initialize handler": function () {
			var err = new Error("bug out");
			var foo = Component.create({
				"sig/initialize": function() {
					throw err;
				}
			});
			return start.call(foo).otherwise(function(error) {
				assert.same(error, err);
			});
		},

		"bug out within task": function () {
			var err = new Error("bug out");
			return Component.create({
				"sig/task": function() {
					throw err;
				}
			}).task(delay(100)).otherwise(function(error) {
				assert.same(error, err);
			});
		},

		"event handlers - setup/add/remove/teardown": function() {
			function handler1() {}
			function handler2() {}

			var setup = this.spy();
			var add = this.spy();
			var remove = this.spy();
			var teardown = this.spy();

			var foo = Component.create({
				"sig/setup": setup,
				"sig/add": add,
				"sig/remove": remove,
				"sig/teardown": teardown
			});

			foo
				.on("foo", handler1)
				.on("foo", handler2)
				.off("foo", handler1)
				.off("foo", handler2);

			var handlers = foo.handlers["foo"];

			assert.calledOnce(setup);
			assert.calledTwice(add);
			assert.calledTwice(remove);
			assert.calledOnce(teardown);

			assert.calledWith(setup, handlers, "foo", handler1);
			assert.calledWith(add, handlers, "foo", handler1);
			assert.calledWith(add, handlers, "foo", handler2);
			assert.calledWith(remove, handlers, "foo", handler1);
			assert.calledWith(remove, handlers, "foo", handler2);
			assert.calledWith(teardown, handlers, "foo", handler2);
		},

		"event handlers - add - prevent default": function() {
			function handler() {
				assert(false);
			}
			var eventData = {};

			var add = this.spy();
			var bar = Component.extend({
				"sig/add": function() {
					assert(false);
				}
			}).create({
				"sig/add": function() {
					add.apply(add, arguments);
					return false;
				}
			});

			var evt = "bar";
			bar.on(evt, handler, eventData);
			assert.calledOnce(add);
			assert.calledWith(add, sinon.match.any, evt, handler, eventData);
			return bar.emit(evt);
		},

		"event handlers - remove - prevent default": function() {
			var handle = this.spy();
			function handler() {
				handle();
			}

			var off = this.spy();

			var bar = Component.extend({
				"sig/remove": function() {
					assert(false);
				}
			}).create({
				"sig/remove": function() {
					off.apply(off, arguments);
					return false;
				}
			});

			var evt = "bar";
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
