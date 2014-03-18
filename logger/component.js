/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"../event/emitter",
	"troopjs-utils/merge"
], function LoggerModule(Emitter, merge) {
	"use strict";

	/**
	 * Basic logging component.
	 *
	 * 	// Get a hold of the logger
	 * 	var logger = require("troopjs-core/logger/component");
	 *
	 * 	// Taps the logger chain to `console.log`
	 * 	logger.tap(console.log);
	 *
	 * 	// Log a simple message to the console
	 * 	logger.log("this is a log message");
	 *
	 * @class core.logger.component
	 * @extends core.event.emitter
	 * @singleton
	 */

	var OBJECT_TOSTRING = Object.prototype.toString;
	var TOSTRING_OBJECT = "[object Object]";
	var LOG_APPEND = "log/append";

	/**
	 * Log append event
	 * @localdoc Triggered when log payloads should be appended
	 * @event log/append
	 * @param {Object|String} payload Log payload
	 * @param {Date} payload.time Time
	 * @param {String} payload.cat Category
	 * @param {String} [payload.msg] Message
	 */

	/**
	 * @method off
	 * @inheritdoc
	 * @private
	 */

	/**
	 * @method on
	 * @inheritdoc
	 * @private
	 */

	/**
	 * @method emit
	 * @inheritdoc
	 * @private
	 */

	/**
	 * @method create
	 * @static
	 * @hide
	 */

	/**
	 * @method extend
	 * @static
	 * @hide
	 */

	/**
	 * @method constructor
	 * @hide
	 */

	/**
	 * Create an appender function
	 * @param {String} cat Category
	 * @return {Function}
	 * @ignore
	 */
	function appender(cat) {
		return function append(msg) {
			var me = this;
			var result = {
				"cat" : cat,
				"time": new Date().getTime()
			};

			if (OBJECT_TOSTRING.call(msg) === TOSTRING_OBJECT) {
				merge.call(result, msg);
			}
			else {
				result.msg = msg;
			}

			return me.emit.call(me, LOG_APPEND, result);
		}
	}

	return Emitter.create({
		"displayName": "core/logger/component",

		/**
		 * Adds a callback that 'taps' into the log chain
		 * @param {Function} callback Callback
		 * @param {Object} callback.payload Log payload
		 * @param {Date} callback.payload.time Time
		 * @param {String} callback.payload.cat Category
		 * @param {String} [callback.payload.msg] Message
		 * @param {*} [data] Handler data
		 */
		"tap": function tap(callback, data) {
			var me = this;

			return me.on(LOG_APPEND, me, callback, data);
		},

		/**
		 * Removes a callback from the log chain
		 * @param {Function} [callback] Callback previously registered with {@link #tap}
		 */
		"untap": function untap(callback) {
			var me = this;

			return me.off(LOG_APPEND, me, callback);
		},

		/**
		 * Forwards payload to all {@link #event-log/append} callbacks registered via {@link #tap}
		 * @handler log/append
		 * @inheritdoc #event-log/append
		 */

		/**
		 * Logs a message that is logging like
		 * @method
		 * @inheritdoc #event-log/append
		 * @fires log/append
		 */
		"log": appender("log"),

		/**
		 * Logs a message that is information like
		 * @method
		 * @inheritdoc #event-log/append
		 * @fires log/append
		 */
		"info": appender("info"),

		/**
		 * Logs a message that is warning like
		 * @method
		 * @inheritdoc #event-log/append
		 * @fires log/append
		 */
		"warn": appender("warn"),

		/**
		 * Logs a message that is debugging like
		 * @method
		 * @inheritdoc #event-log/append
		 * @fires log/append
		 */
		"debug": appender("debug"),

		/**
		 * Logs a message that is actually an error
		 * @method
		 * @inheritdoc #event-log/append
		 * @fires log/append
		 */
		"error": appender("error")
	});
});
