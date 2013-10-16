/*
 * TroopJS core/logger/pubsub
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([ "../component/base", "../pubsub/hub" ], function PubSubLogger(Component, hub) {
	"use strict";

	var ARRAY_PUSH = Array.prototype.push;
	var PUBLISH = hub.publish;

	/**
	 * This module provides a logger that simply publish logging events on hub.
	 * @class core.logger.pubsub
	 * @singleton
	 */
	return Component.create({
		"displayName" : "core/logger/pubsub",

		/**
		 * @inheritdoc core.logger.console#log
		 */
		"log": function log() {
			var args = [ "logger/log" ];
			ARRAY_PUSH.apply(args, arguments);
			PUBLISH.apply(hub, args);
		},

		/**
		 * @inheritdoc core.logger.console#warn
		 */
		"warn" : function warn() {
			var args = [ "logger/warn" ];
			ARRAY_PUSH.apply(args, arguments);
			PUBLISH.apply(hub, args);
		},

		/**
		 * @inheritdoc core.logger.console#debug
		 */
		"debug" : function debug() {
			var args = [ "logger/debug" ];
			ARRAY_PUSH.apply(args, arguments);
			PUBLISH.apply(hub, args);
		},

		/**
		 * @inheritdoc core.logger.console#info
		 */
		"info" : function info() {
			var args = [ "logger/info" ];
			ARRAY_PUSH.apply(args, arguments);
			PUBLISH.apply(hub, args);
		},

		"error" : function info() {
			var args = [ "logger/error" ];
			ARRAY_PUSH.apply(args, arguments);
			PUBLISH.apply(hub, args);
		}
	});
});