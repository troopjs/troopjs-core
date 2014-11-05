/*globals buster:false*/
buster.testCase("troopjs-core/event/emitter", function (run) {
	"use strict";

	var assert = buster.referee.assert;

	require( [ "troopjs-core/event/emitter", "when", "when/delay" ] , function (Emitter, when, delay) {

		run({
			"on/emit" : function () {
				var arg = "TEST";

				return Emitter()
					.on("test", function onTest(test) {
						assert.same(arg, test);
					})
					.emit("test", arg);
			},

			"on/emit again": function() {
				var arg = "TEST";
				var emitter = Emitter();
				var count = 0;

				return emitter
					.on("test", function() {
						count++;
					})
					.emit("test", arg)
					.then(function () {
						return emitter.emit("test", arg)
							.then(function () {
								assert.equals(count, 2);
							});
					});
			},

			"on/emit again with different arg": function() {
				var emitter = Emitter();
				var last;

				return emitter
					.on("test", function(test) {
						last = test;
					})
					.emit("test", "test")
					.then(function () {
						return emitter.emit("test", "test2")
							.then(function () {
								assert.equals(last, "test2");
							});
					});
			},

			"on/emit 2 emitters": function() {
				var emitter1 = Emitter();
				var emitter2 = Emitter();

				emitter1.on("one", function(arg) {
					assert.same(arg, "one");
				});

				emitter2.on("two", function(arg) {
					assert.same(arg, 2);
				});

				return emitter1.emit("one", "one").then(function () {
					return emitter2.emit("two", 2);
				});
			},

			"on/emit single handler shares two context": function() {
				var emitter = Emitter();
				var count = 0;
				var ctx1 = {}, ctx2 = {}, handler = function() {
					// Assertion of different context.
					assert.same(++count === 1? ctx1 : ctx2, this);
				};

				emitter
					.on("one", {
						"context": ctx1,
						"callback": handler
					})
					.on("one", {
						"context": ctx2,
						"callback": handler
					});

				return emitter.emit("one").then(function () {
					assert.same(2, count);
				});
			},

			"on/emit async subscribers": function() {
				var emitter = Emitter();

				this.timeout = 1500;
				var count = 0;

				return emitter
					.on("one", function () {
						return ++count;
					})
					.on("one", function () {
						return delay(500, ++count);
					})
					.on("one", function () {
						return delay(500, ++count);
					})
					.emit("one")
					.spread(function (first, second, third) {
						assert.same(first, 1);
						assert.same(second, 2);
						assert.same(third, 3);
					});
			},

			"off/emit with context and callback": function() {
				var emitter = Emitter();
				var last;

				var one = function() {
					last = "one";
				};

				var two = function() {
					last = "two";
				};

				return emitter
					.on("test", one)
					.on("test", two)
					.emit("test")
					.then(function () {
						assert.equals(last, "two");

						return emitter
							.off("test", two)
							.emit("test")
							.then(function () {
								assert.equals(last, "one");
							});
					});
			},

			"off/emit with context": function() {
				var emitter = Emitter();
				var ctx1 = {};
				var ctx2 = {};
				var last;

				var one = function() {
					last = "one";
				};

				var two = function() {
					last = "two";
				};

				return emitter
					.on("test", {
						"context": ctx1,
						"callback": one
					})
					.on("test", {
						"context": ctx2,
						"callback": two
					})
					.emit("test")
					.then(function () {
						assert.equals(last, "two");

						return emitter
							.off("test", {
								"context": ctx2
							})
							.emit("test")
							.then(function () {
								assert.equals(last, "one");
							});
					});
			},

			"off/emit": function() {
				var emitter = Emitter();
				var last;

				var one = function() {
					last = "one";
				};

				var two = function() {
					last = "two";
				};

				return emitter
					.on("test", one)
					.on("test", two)
					.emit("test")
					.then(function () {
						assert.equals(last, "two");

						last = "three";

						return emitter
							.off("test")
							.emit("test")
							.then(function () {
								assert.equals(last, "three");
							});
					});
			},

			"on/emit reject": function () {
				var emitter = Emitter();

				return emitter
					.on("test", function (pass) {
						return pass
							? when.resolve()
							: when.reject();
					})
					.on("test", function (pass) {
						assert.isTrue(pass);
					})
					.emit("test", false)
					.then(function () {
						assert(false);
					}, function() {
						assert(true);
					})
					.ensure(function () {
						return emitter
							.emit("test", true)
							.then(function () {
								assert(true);
							}, function() {
								assert(false);
							});
					});
			},

			"limit - one": function ()  {
				var emitter = Emitter();
				var spy = this.spy();

				return emitter
					.one("test", spy)
					.emit("test")
					.then(function () {
						return emitter.emit("test");
					})
					.then(function () {
						assert.calledOnce(spy);
					});
			},

			"limit - many": function () {
				var emitter = Emitter();
				var spy = this.spy();

				return emitter
					.on("test", {
						"callback": spy,
						"context": emitter,
						"limit": 2
					})
					.emit("test")
					.then(function () {
						return emitter.emit("test");
					})
					.then(function () {
						return emitter.emit("test");
					})
					.then(function () {
						assert.calledTwice(spy);
					});
			},

			"bug out in the first event handler": function() {
				var emitter = Emitter();
				var err = new Error("bug out");
				return emitter.on("foo", function() {
					throw err;
				})
				.emit("foo").otherwise(function(error) {
						assert.same(error, err);
				});
			}
		});
	});
});
