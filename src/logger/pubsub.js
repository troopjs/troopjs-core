/**
 * TroopJS core/logger/pubsub
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define([ "compose", "../component/base", "../pubsub/hub" ], function PubSubLogger(Compose, Component, hub) {
    var ARRAY_PUSH = Array.prototype.push;
    var PUBLISH = hub.publish;

    return Compose.create(Component, {
        "log": function log(){
            var args = [ "logger/log" ];
            ARRAY_PUSH.apply(args, arguments);
            PUBLISH.apply(hub, arguments);
        },
        "warn" : function warn() {
            var args = [ "logger/warn" ];
            ARRAY_PUSH.apply(args, arguments);
            PUBLISH.apply(hub, arguments);
        },
        "debug" : function debug() {
            var args = [ "logger/debug" ];
            ARRAY_PUSH.apply(args, arguments);
            PUBLISH.apply(hub, arguments);
        },
        "info" : function info() {
            var args = [ "logger/info" ];
            ARRAY_PUSH.apply(args, arguments);
            PUBLISH.apply(hub, arguments);
        }
    });
});