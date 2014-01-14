/*globals buster:false*/
buster.testCase("troopjs-core/pubsub/hub", function (run) {
	"use strict";

	var assert = buster.referee.assert;

	require( [ "troopjs-core/pubsub/hub", "when", "when/delay" ] , function (hub, when, delay) {

		run({
			"subscribe/publish sync subscribers" : function (done) {
				var foo = "FOO", bar = "BAR";
				hub
					.subscribe("foo/bar", this, function (arg) {
						assert.same(foo, arg);
						return [arg, bar];
					})
					.subscribe("foo/bar", this, function (arg1, arg2) {
						assert.same(foo, arg1);
						assert.same(bar, arg2);
					})
					.publish("foo/bar", foo)
					.then(done);
			},

			"subscribe/publish async subscribers": function(done) {
				var foo = "FOO", bar = "BAR";
				this.timeout = 1000;
				hub
					.subscribe("foo/bar", this, function (arg) {
						assert.same(foo, arg);
						return when.resolve([arg, bar]);
					})
					.subscribe("foo/bar", this, function (arg1, arg2) {
						assert.same(foo, arg1);
						assert.same(bar, arg2);
						return delay(500, [bar]);
					})
					.subscribe("foo/bar", this, function (arg1) {
						assert.same(bar, arg1);
					})
					.publish("foo/bar", foo)
					.then(done);
			}
		});
	});
});
