/*globals buster:false*/
buster.testCase("troopjs-core/component/base", function (run) {
	"use strict";

	var assert = buster.referee.assert;

	require( [ "troopjs-core/component/base", "when/delay" ] , function (Component, delay) {

	run({
			"signal sync": function (done) {
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

				Bar().signal("foo", 123, "abc").then(function () {
					assert.same(2, count);
					done();
				});
			},

			"signal async": function (done) {
				this.timeout = 500;
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

				Bar().signal("foo", 123, "abc").then(function () {
					assert.same(2, count);
					done();
				});
			},

			"declarative event async": function (done) {
				this.timeout = 500;
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

				Bar().emit("foo", 123, "abc").then(function () {
					assert.same(2, count);
					done();
				});
			}
		});
	});
});
