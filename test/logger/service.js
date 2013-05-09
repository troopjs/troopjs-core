buster.testCase("troopjs-core/logger/service", function (run) {
	var assert = buster.assert;

	define("config", {});

	require( [ "troopjs-core/logger/service", "troopjs-core/logger/pubsub" ] , function (service, logger) {
		run({
			"setUp":function(){
				service().start();
			},
			"log" : function () {
				var a = 0;
				// setInterval(function(){
					logger.log('Test Message' + (++a));
					logger.warn('Test Message' + (++a));
					logger.debug('Test Message' + (++a));
					logger.info('Test Message' + (++a));
					logger.error('Test Message' + (++a));
				// },49);
			}
		});
	});
});