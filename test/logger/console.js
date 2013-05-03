buster.testCase("troopjs-core/logger/console", function (run) {
    var assert = buster.assert;

    define("config", {});

    require( [ "troopjs-core/logger/console" ] , function (logger) {
        run({
            "log" : function () {
                logger.log("this is a log message");
            }
        });
    });
});