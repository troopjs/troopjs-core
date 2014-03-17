/*globals buster:false*/
buster.testCase("troopjs-core/component/base", function (run) {
	"use strict";

	var assert = buster.referee.assert;
	var sinon = buster.sinon;

	require( [ "troopjs-core/component/base", "when/delay" ] , function (Component, delay) {

		var PHASES = {
			"INITIAL": undefined,
			"INITIALIZE": "initialize",
			"STARTED": "started",
			"STOP": "stop",
			"FINALIZED": "finalized"
		};

		run({
			"setUp": function () {
				this.timeout = 500;
			},

			"signal sync": function () {
				var count = 0;

				function onSignal(arg1, arg2) {
					count++;
					assert.equals(arg1, 123);
					assert.equals(arg2, "abc");
				}

				var Foo = Component.extend({
					"sig/foo": onSignal
				});

				var Bar = Foo.extend({
					"sig/foo": onSignal
				});

				return Bar().signal("foo", 123, "abc").then(function () {
					assert.equals(count, 2);
				});
			},

			"signal async": function () {
				var count = 0;

				function onSignal(arg1, arg2) {
					count++;
					assert.equals(arg1, 123);
					assert.equals(arg2, "abc");
					return delay(200);
				}

				var Foo = Component.extend({
					"sig/foo": onSignal
				});

				var Bar = Foo.extend({
					"sig/foo": onSignal
				});

				return Bar().signal("foo", 123, "abc").then(function () {
					assert.equals(count, 2);
				});
			},

			"declarative event async": function () {
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

				return bar.start().then(function () {
					return bar.emit("foo", 123, "abc").then(function () {
						assert.equals(count, 2);
					});
				});
			},

			"phase - match": function () {
				this.timeout = 500;
				var foo = Component.create({
					"sig/start": function() {
						return delay(200);
					},
					"sig/finalize": function() {
						return delay(200);
					}
				});

				assert.equals(foo.phase, PHASES.INITIAL);

				var started = foo.start().then(function() {
					assert.equals(foo.phase, PHASES.STARTED);
					var stopped = foo.stop().then(function() {
						assert.equals(foo.phase, PHASES.FINALIZED);
					});
					assert.equals(foo.phase, PHASES.STOP);
					return stopped;
				});
				assert.equals(foo.phase, PHASES.INITIALIZE);
				return started;
			},

			"phase - guardian": function () {
				var foo = Component.create({});
				// Invalid call to stop before component started.
				assert.exception(function() {
					foo.stop();
				});

				return foo.start().then(function() {
					// Invalid call to start after started.
					assert.exception(function() { foo.start(); });

					return foo.stop().then(function() {
						// Invalid call to stop after stopped.
						assert.exception(function() { foo.stop(); });
					});
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
				bar.emit(evt);
			},

			"event handlers - off - prevent default": function() {
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
				bar.emit(evt);
				assert.calledOnce(handle);
			}
		});
	});
});
