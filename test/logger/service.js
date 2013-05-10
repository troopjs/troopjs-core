buster.testCase("troopjs-core/logger/service", function (run) {
	var ARRAY_PUSH = Array.prototype.push;
	var assert = buster.assert;

	define("config", {});

	require( [ "troopjs-core/logger/service", "troopjs-core/component/gadget", "troopjs-core/pubsub/hub", "troopjs-utils/deferred" ] , function (Service, Gadget, hub, Deferred) {
		var Appender = Gadget.extend({
			"append" : function () {
				var args = [ this.toString() ];

				ARRAY_PUSH.apply(args, arguments);

				console.log.apply(console, args);
			}
		});

		run({
			"log" : function (done) {
				Deferred(function (dfd) {
					Service(Appender(), Appender()).start(dfd);
				})
					.done(function () {
						var self = this;

						hub.publish("logger/log", "message");
						hub.publish("logger/warn", "message");
						hub.publish("logger/debug", "message");
						hub.publish("logger/info", "message");
						hub.publish("logger/error", "message");

						Deferred(function (dfd) {
							self.stop(dfd);
						})
							.done(function () {
								assert(true);
								done();
							});
					});
			}
		});
	});
});