buster.testCase("troopjs-core/logger/console", function (run) {
	var assert = buster.assert;

	define("config", {});

	require( [ "troopjs-core/logger/console" ] , function (logger) {
		run({
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
				logger.error("this is a error message");
			}
		});
	});
});