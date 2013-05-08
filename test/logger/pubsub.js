buster.testCase("troopjs-core/logger/pubsub", function (run) {
	var assert = buster.assert;
	var LOGGER_LOG = "logger/log";
	var LOGGER_WARN = "logger/warn";
	var LOGGER_DEBUG = "logger/debug";
	var LOGGER_INFO = "logger/info";

	define("config", {});

	require( [ "troopjs-core/logger/pubsub", "troopjs-core/pubsub/hub" ] , function (logger, hub) {
		run({
			"tearDown" : function () {
				hub.unsubscribe(LOGGER_LOG);
				hub.unsubscribe(LOGGER_WARN);
				hub.unsubscribe(LOGGER_DEBUG);
				hub.unsubscribe(LOGGER_INFO);
			},

			"log" : function (done) {
				hub.subscribe(LOGGER_LOG, done);
				logger.log("this is a log message");
			},
			"warn" : function (done) {
				hub.subscribe(LOGGER_WARN, done);
				logger.warn("this is a warn message");
			},
			"debug" : function (done) {
				hub.subscribe(LOGGER_DEBUG, done);
				logger.debug("this is a debug message");
			},
			"info" : function (done) {
				hub.subscribe(LOGGER_INFO, done);
				logger.info("this is a info message");
			}
		});
	});
});