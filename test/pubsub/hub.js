/*globals buster:false*/
buster.testCase("troopjs-core/pubsub/hub", function (run) {
	"use strict";

	var assert = buster.referee.assert,
		refute = buster.referee.refute;

	require( [ "troopjs-core/pubsub/hub", "when", "when/delay" ] , function (hub, when, delay) {

		run({
			"setUp" : function () {
				this.timeout = 1000;
			},

			"subscribe/publish sync subscribers" : function () {
				var foo = "FOO", bar = "BAR";
				return hub
					.subscribe("foo/bar", this, function (arg) {
						assert.same(foo, arg);
						// Return the arguments.
						return [arg, bar];
					})
					.subscribe("foo/bar", this, function (arg1, arg2) {
						assert.same(foo, arg1);
						assert.same(bar, arg2);
						// Return no value.
					})
					.subscribe("foo/bar", this, function (arg1, arg2) {
						// Arguments received are to be same as the previous one.
						assert.same(foo, arg1);
						assert.same(bar, arg2);
					})
					.publish("foo/bar", foo);
			},

			"subscribe/publish async subscribers": function() {
				var foo = "FOO", bar = "BAR";
				return hub.subscribe("foo/bar", this, function (arg) {
						assert.same(foo, arg);
						return when.resolve([arg, bar]);
					})
					.subscribe("foo/bar", this, function (arg1, arg2) {
						assert.same(foo, arg1);
						assert.same(bar, arg2);
						return delay(200, [bar]);
					})
					.subscribe("foo/bar", this, function (arg1) {
						assert.same(bar, arg1);
						// Return a promise that resolves to no value.
						return delay(200, undefined);
					})
					.subscribe("foo/bar", this, function (arg1, arg2) {
						// Arguments received are to be same as the previous one.
						assert.same(bar, arg1);
						refute.defined(arg2);
					})
					.publish("foo/bar", foo);
			},

			"subscribe/publish - using explicit sequence runner": function () {
				var context = this;
				var foo = "FOO", bar = "BAR", count = 0;
				return hub.subscribe("test", context, function (arg) {
						assert.same(foo, arg);
						count++;
						return [foo, bar];
					})
					.subscribe("test", context, function (arg1, arg2) {
						// Arguments received are to be same as the previous one.
						assert.same(foo, arg1);
						refute.defined(arg2);
						count++;
					})
					.publish("test:sequence", foo)
					.then(function () {
						assert.same(2, count);
					});
			},

			"republish": function() {
				var context = this;
				var count = 0;

				return hub.subscribe("republish", context, function(message){
						assert.equals(message, "republish");
						count++;
					})
					.publish("republish", "republish")
					.then(function () {
						return hub.republish("republish", context, function(message) {
								assert.equals(message, "republish");
							})
					});
			}
		});
	});
});
