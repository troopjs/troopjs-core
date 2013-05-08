buster.testCase("troopjs-core/logger/service", function (run) {
	var assert = buster.assert;
	var LOGGER_LOG = "logger/log";

	define("config", {});

	require( [ "troopjs-core/logger/service", "troopjs-core/logger/pubsub" ] , function (service, logger) {
		run({
			"log" : function () {
				var a = 0;
				// setInterval(function(){
					logger.log('Test Message' + (++a));
				// },49);
			}
		});
	});
});