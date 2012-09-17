buster.testCase("troopjs-core/pubsub/hub", function (run) {
	var assert = buster.assert;

	define("config", {});

	require( [ "troopjs-core/pubsub/hub" ] , function (hub) {
		run({
			"single subscribe/publish" : function () {
				var arg = "TEST";

				hub
					.subscribe("test", function onTest(topic, test) {
						assert.same(arg, test);
					})
					.publish("test", arg);
			},

			"multiple subscribe/publish" : function () {
				var arg = "TEST";

				hub
					.subscribe("test", function onTest(topic, test) {
						assert.same(arg, test);
					})
					.subscribe("test", function onTest(topic, test) {
						assert.same(arg, test);
					})
					.publish("test", arg)
					.publish("test", arg);
			}
		});
	});
});