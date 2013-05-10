buster.testCase("troopjs-core/logger/pubsub", function (run) {
	var LOGGER_LOG = "logger/log";
	var LOGGER_WARN = "logger/warn";
	var LOGGER_DEBUG = "logger/debug";
	var LOGGER_INFO = "logger/info";
	var LOGGER_INFO = "logger/error";
	var assert = buster.assert;

	function done() {
		assert(true);
	}

	define("config", {});

	require( [ "troopjs-core/logger/pubsub", "troopjs-core/pubsub/hub" ] , function (logger, hub) {
		run({
			"setUp" : function () {
				hub.subscribe(LOGGER_LOG, done);
				hub.subscribe(LOGGER_WARN, done);
				hub.subscribe(LOGGER_DEBUG, done);
				hub.subscribe(LOGGER_INFO, done);
			},

			"tearDown" : function () {
				hub.unsubscribe(LOGGER_LOG, done);
				hub.unsubscribe(LOGGER_WARN, done);
				hub.unsubscribe(LOGGER_DEBUG, done);
				hub.unsubscribe(LOGGER_INFO, done);
			},

			"log" : function () {
				logger.log("this is a log message");
			},
			"warn" : function () {
				logger.warn("this is a warn message");
			},
			"debug" : function () {
				logger.debug("this is a debug message");
			},
			"info" : function () {
				logger.info("this is a info message");
			},
			"error" : function () {
				logger.info("this is a error message");
			}
		});
	});
});