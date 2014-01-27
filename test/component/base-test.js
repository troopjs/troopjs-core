/*globals buster:false*/
buster.testCase("troopjs-core/component/base", function (run) {
	"use strict";

	var assert = buster.referee.assert;

	require( [ "troopjs-core/component/base", "when/delay" ] , function (Component, delay) {

		var PHASES = {
			"INITIAL": undefined,
			"INITIALIZE": "initialize",
			"STARTED": "started",
			"STOP": "stop",
			"FINALIZED": "finalized"
		};

			"signal sync": function () {
				var count = 0;
				function onSignal(arg1, arg2) {
					count++;
					assert.same(123, arg1);
					assert.same("abc", arg2);
				}

				var Foo = Component.extend({
					"sig/foo": onSignal
				});

				var Bar = Foo.extend({
					"sig/foo": onSignal
				});

				return Bar().signal("foo", 123, "abc").then(function () {
					assert.same(2, count);
				});
			},

			"signal async": function () {
				var count = 0;

				function onSignal(arg1, arg2) {
					count++;
					assert.same(123, arg1);
					assert.same("abc", arg2);
					return delay(200);
				}

				var Foo = Component.extend({
					"sig/foo": onSignal
				});

				var Bar = Foo.extend({
					"sig/foo": onSignal
				});

				return Bar().signal("foo", 123, "abc").then(function () {
					assert.same(2, count);
				});
			},

			"declarative event async": function () {
				var count = 0;

				function onEvent(arg1, arg2) {
					count++;
					assert.same(123, arg1);
					assert.same("abc", arg2);
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
						assert.same(2, count);
					});
				});
			},

			"phase - match": function () {
				this.timeout = 500;
				var foo = Component.create({
					"sig/start": function() {
						delay(200);
					},
					"sig/finalize": function() {
						delay(200);
					}
				});
				assert.same(PHASES.INITIAL, foo.phase);
				var started = foo.start().then(function() {
					assert.same(PHASES.STARTED, foo.phase);
					var stopped = foo.stop().then(function() {
						assert.same(PHASES.FINALIZED, foo.phase);
					});
					assert.same(PHASES.STOP, foo.phase);
					return stopped;
				});
				assert.same(PHASES.INITIALIZE, foo.phase);
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
			}
		});
	});
});
