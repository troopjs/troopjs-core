define([
	"../../pubsub/hub",
	"jquery",
	"when/when",
	"when/delay"
], function (hub, $, when, delay) {
	"use strict";

	var assert = buster.referee.assert;
	var refute = buster.referee.refute;

	buster.testCase("troopjs-core/pubsub/hub", {
		"setUp" : function () {
			this.timeout = 1000;
		},

		"subscribe/publish sync subscribers" : function () {
			var foo = "FOO";
			var bar = "BAR";

			hub.subscribe("foo/bar", function (arg) {
				assert.same(foo, arg);
				// Return an array.
				return [arg, bar];
			});
			hub.subscribe("foo/bar", function (arg1, arg2) {
				assert.same(foo, arg1);
				assert.same(bar, arg2);
				// Return no value.
			});
			hub.subscribe("foo/bar", function (arg1, arg2) {
				// Arguments received are to be same as the previous one.
				assert.same(foo, arg1);
				assert.same(bar, arg2);

				// Return array-like arguments
				return arguments;
			});
			hub.subscribe("foo/bar", function (arg1, arg2) {
				// Arguments received are to be same as the previous one.
				assert.same(foo, arg1);
				assert.same(bar, arg2);

				// Return a single value.
				return arg1;
			});
			hub.subscribe("foo/bar", function (arg1, arg2) {
				assert.same(foo, arg1);
				refute.defined(arg2);

				// Return array-alike jQuery object.
				return $("<span></span><span></span>");
			});
			hub.subscribe("foo/bar", function (arg1, arg2) {
				assert.defined(arg1.jquery);
				refute.defined(arg2);
			});
			return hub.publish("foo/bar", foo);
		},

		"subscribe/publish async subscribers": function() {
			var foo = "FOO";
			var bar = "BAR";

			hub.subscribe("foo/bar", function (arg) {
				assert.same(foo, arg);
				return when.resolve([arg, bar]);
			});
			hub.subscribe("foo/bar", function (arg1, arg2) {
				assert.same(foo, arg1);
				assert.same(bar, arg2);
				return delay(200, [bar]);
			});
			hub.subscribe("foo/bar", function (arg1) {
				assert.same(bar, arg1);
				// Return a promise that resolves to no value.
				return delay(200, foo);
			});
			hub.subscribe("foo/bar", function (arg1, arg2) {
				assert.same(foo, arg1);
				refute.defined(arg2);

				// Return a promise that resolves to no value.
				return delay(200, undefined);
			});
			hub.subscribe("foo/bar", function (arg1, arg2) {
				// Arguments received are to be same as the previous one.
				assert.same(foo, arg1);
				refute.defined(arg2);

				// Return array-alike jQuery object.
				return delay(200, $("<span></span><span></span>"));
			});
			hub.subscribe("foo/bar", function(arg1, arg2) {
				assert.defined(arg1.jquery);
				refute.defined(arg2);
			});
			return hub.publish("foo/bar", foo);
		},

		"bug out in first hub subscriber": function() {
			var err = new Error("bug out");
			hub.subscribe("foo/bar", function() {
				throw err;
			});
			return hub.publish("foo/bar").otherwise(function(error) {
				assert.same(error, err);
			});
		},
		"tearDown": function () {
			hub.unsubscribe("foo/bar");
		}
	});
});
