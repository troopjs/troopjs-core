/**
 * TroopJS core/logger/pubsub
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define([ "../component/service", "troopjs-utils/merge" ], function logger(Service, Merge) {
    var UNDEFINED = undefined;
    var ARRAY_PROTO = Array.prototype;
    var PUSH = ARRAY_PROTO.push;
    var LENGTH = "length";
    var BATCHES = "batches";
    var INTERVAL = "interval";
    var STRING = 'string';
    var OBJECT = 'object';

    function initLog(cat){
        return {
            'cat': cat,
            'href': window.location.href,
            'browser': navigator.userAgent,
            'time': new Date().getTime()
        }
    }

    function mergeLog(logObj, log){
        if(typeof log === STRING){
            logObj['msg'] = log;
        }
        else if(typeof log === OBJECT){
            Merge.call(logObj, log);
        }
        return logObj;
    }

    return Service.extend(function loggerService() {
        this[BATCHES] = [];
    }, {
        displayName : "ef/service/logger",

        "sig/start" : function start(signal, deferred) {
            var self = this;

            console.log('sig/start');

            if (!(INTERVAL in self)) {
                self[INTERVAL] = setInterval(function batchInterval() {
                    if(self[BATCHES][LENGTH] === 0){
                        return;
                    }

                    console.log(self[BATCHES]);

                    self[BATCHES] = [];

                }, 200);
            }

            if (deferred) {
                deferred.resolve();
            }
        },

        "sig/stop" : function stop(signal, deferred) {
            var self = this;

            // Only do this if we have an interval
            if (INTERVAL in self) {
                // Clear interval
                clearInterval(self[INTERVAL]);

                // Reset interval
                delete self[INTERVAL];
            }

            if (deferred) {
                deferred.resolve();
            }
        },

        "hub/logger/log" : function logger(topic, log, deferred) {
            var self = this;
            var batches = self[BATCHES];
            var logObj = initLog('log');

            PUSH.call(batches, mergeLog(logObj, log));
        },

        "hub/logger/warn" : function logger(topic, log, deferred) {
            var self = this;
            var batches = self[BATCHES];
            var logObj = initLog('warn');

            PUSH.call(batches, mergeLog(logObj, log));
        },

        "hub/logger/debug" : function logger(topic, log, deferred) {
            var self = this;
            var batches = self[BATCHES];
            var logObj = initLog('debug');

            PUSH.call(batches, mergeLog(logObj, log));
        },

        "hub/logger/info" : function logger(topic, log, deferred) {
            var self = this;
            var batches = self[BATCHES];
            var logObj = initLog('info');

            PUSH.call(batches, mergeLog(logObj, log));
        },

        "hub/logger/error" : function logger(topic, log, deferred) {
            var self = this;
            var batches = self[BATCHES];
            var logObj = initLog('error');

            PUSH.call(batches, mergeLog(logObj, log));
        }

    });
});