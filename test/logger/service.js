buster.testCase("troopjs-core/logger/service", function (run) {
	var ARRAY_PUSH = Array.prototype.push;
	var assert = buster.assert;

	require( [ "troopjs-core/logger/service", "troopjs-core/component/gadget", "troopjs-core/pubsub/hub" ] , function (Service, Gadget, hub) {
		var Appender = Gadget.extend({
			"append" : function () {
				var args = [ this.toString() ];

				ARRAY_PUSH.apply(args, arguments);

				console.log.apply(console, args);
			}
		});

		run({
			"log" : function (done) {
				Service(Appender(), Appender()).start().then(function () {
					var self = this;

					hub.publish("logger/log", "message");
					hub.publish("logger/warn", "message");
					hub.publish("logger/debug", "message");
					hub.publish("logger/info", "message");
					hub.publish("logger/error", "message");

					self.stop().then(function () {
						assert(true);
						done();
					});
				});
			}
		});
	});
});