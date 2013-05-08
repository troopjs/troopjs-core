/**
 * TroopJS core/logger/pubsub
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define([ "../pubsub/topic", "troopjs-utils/deferred", "troopjs-utils/merge" ], function PubSubLogger(Topic, Deferred, merge) {
    var UNDEFINED = undefined;
    var ARRAY_PROTO = Array.prototype;
    var SLICE = ARRAY_PROTO.slice;
    var CONCAT = ARRAY_PROTO.concat;
    var PUSH = ARRAY_PROTO.push;
    var LENGTH = "length";
    var BATCHES = "batches";
    var INTERVAL = "interval";

    return Service.extend(function loggerService() {
        this[BATCHES] = [];
    }, {
        displayName : "ef/service/logger",

        "sig/start" : function start(signal, deferred) {
            var self = this;

            if (!(INTERVAL in self)) {
                self[INTERVAL] = setInterval(function batchInterval() {
                    if(self[BATCHES].length === 0){
                        return;
                    }

                    console.log(self[BATCHES]);

                    self[BATCHES] = [];
                }, 200);
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

            batches.push(log);
        }
    });
});