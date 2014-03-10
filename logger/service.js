/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"../component/service",
	"troopjs-utils/merge",
	"when"
], function logger(Service, merge, when) {
	"use strict";

	/**
	 * Provides logging as a service, with appender support.
	 * @class core.logger.service
	 * @extends core.component.service
	 */

	var ARRAY_PROTO = Array.prototype;
	var ARRAY_SLICE = ARRAY_PROTO.slice;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var OBJECT_TOSTRING = Object.prototype.toString;
	var TOSTRING_OBJECT = "[object Object]";
	var LENGTH = "length";
	var APPENDERS = "appenders";

	function forward(_signal, _args) {
		/*jshint validthis:true*/
		var me = this;
		var signal = me.signal;
		var args = [ _signal ];
		var appenders = me[APPENDERS];
		var index = 0;

		ARRAY_PUSH.apply(args, _args);

		var next = function () {
			var appender;

			return (appender = appenders[index++])
				? when(signal.apply(appender, args), next)
				: when.resolve(_args);
		};

		return next();
	}

	function convert(cat, message) {
		var result = {
			"cat" : cat,
			"time": new Date().getTime()
		};

		if (OBJECT_TOSTRING.call(message) === TOSTRING_OBJECT) {
			merge.call(result, message);
		}
		else {
			result.msg = message;
		}

		return result;
	}

	function append(obj) {
		/*jshint validthis:true*/
		var me = this;
		var appenders = me[APPENDERS];
		var i;
		var iMax;

		for (i = 0, iMax = appenders[LENGTH]; i < iMax; i++) {
			appenders[i].append(obj);
		}
	}

	/**
	 * Logger `log` event
	 * @localdoc Triggered when a component wants to record a `log` message
	 * @event hub/logger/log
	 * @param {String} msg Message
	 */


	/**
	 * Logger `warn` event
	 * @localdoc Triggered when a component wants to record a `warn` message
	 * @event hub/logger/warn
	 * @param {String} msg Message
	 */

	/**
	 * Logger `debug` event
	 * @localdoc Triggered when a component wants to record a `debug` message
	 * @event hub/logger/debug
	 * @param {String} msg Message
	 */

	/**
	 * Logger `info` event
	 * @localdoc Triggered when a component wants to record a `info` message
	 * @event hub/logger/info
	 * @param {String} msg Message
	 */

	/**
	 * Logger `error` event
	 * @localdoc Triggered when a component wants to record a `error` message
	 * @event hub/logger/error
	 * @param {String} msg Message
	 */

	/**
	 * @method constructor
	 * @param {...Function} appender One or more message appender(s).
	 */
	return Service.extend(function LoggerService(appender) {
		/**
		 * Log appenders
		 * @private
		 * @readonly
		 * @property {...Function[]} appenders
		 */
		this[APPENDERS] = ARRAY_SLICE.call(arguments);
	}, {
		displayName : "core/logger/service",

		/**
		 * @handler
		 * @inheritdoc
		 * @localdoc Forwards event to #appenders
		 */
		"sig/initialize" : function onInitialize() {
			return forward.call(this, "initialize", arguments);
		},

		/**
		 * @handler
		 * @inheritdoc
		 * @localdoc #handler-sig/initialize
		 */
		"sig/start" : function onStart() {
			return forward.call(this, "start", arguments);
		},

		/**
		 * @handler
		 * @inheritdoc
		 * @localdoc #handler-sig/initialize
		 */
		"sig/stop" : function onStop() {
			return forward.call(this, "stop", arguments);
		},

		/**
		 * @handler
		 * @inheritdoc
		 * @localdoc #handler-sig/initialize
		 */
		"sig/finalize" : function onFinalize() {
			return forward.call(this, "finalize", arguments);
		},

		/**
		 * Log a message on hub event.
		 * @handler
		 * @inheritdoc #event-hub/logger/log
		 */
		"hub/logger/log" : function onLog(message) {
			append.call(this, convert("log", message));
		},

		/**
		 * Log a warn on hub event.
		 * @handler
		 * @inheritdoc #event-hub/logger/warn
		 */
		"hub/logger/warn" : function onWarn(message) {
			append.call(this, convert("warn", message));
		},

		/**
		 * Log a debug on hub event.
		 * @handler
		 * @inheritdoc #event-hub/logger/debug
		 */
		"hub/logger/debug" : function onDebug(message) {
			append.call(this, convert("debug", message));
		},

		/**
		 * Log an info on hub event.
		 * @handler
		 * @inheritdoc #event-hub/logger/info
		 */
		"hub/logger/info" : function onInfo(message) {
			append.call(this, convert("info", message));
		},

		/**
		 * Log an error on hub event.
		 * @handler
		 * @inheritdoc #event-hub/logger/error
		 */
		"hub/logger/error" : function onError(message) {
			append.call(this, convert("error", message));
		}
	});
});
