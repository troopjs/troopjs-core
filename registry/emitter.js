/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"../event/emitter",
	"../config",
	"../component/runner",
	"poly/array",
	"poly/object"
], function (Emitter, config, runner) {
	"use strict";

	/**
	 * A light weight implementation to register key/value pairs by key and index
	 * @class core.registry.emitter
	 * @extend core.event.emitter
	 */

	var TYPE = "type";
	var RUNNER = "runner";
	var LENGTH = "length";
	var INDEX = "index";
	var OBJECT_TOSTRING = Object.prototype.toString;
	var TOSTRING_REGEXP = "[object RegExp]";
	var SIG_REGISTER = config.signal.register;
	var SIG_UNREGISTER = config.signal.unregister;

	/**
	 * Register signal
	 * @event sig/register
	 * @localdoc Triggered when something is registered via {@link #register}.
	 * @since 3.0
	 * @param {String} key
	 * @param {*} value
	 */

	/**
	 * Un-register signal
	 * @event sig/unregister
	 * @localdoc Triggered when something is un-registered via {@link #unregister}.
	 * @since 3.0
	 * @param {String} key
	 * @param {*} value
	 */

	/**
	 * @method constructor
	 * @inheritdoc
	 */
	return Emitter.extend(function () {
		/**
		 * Registry index
		 * @private
		 * @readonly
		 */
		this[INDEX] = {};
	}, {
		"displayName": "core/registry/emitter",

		/**
		 * Gets value by key
		 * @param {String|RegExp} [key] key to filter by
		 *  - If `String` get value exactly registered for key.
		 *  - If `RegExp` get value where key matches.
		 *  - If not provided all values registered are returned
		 * @return {*|*[]} result(s)
		 */
		"get": function (key) {
			var index = this[INDEX];
			var result;

			if (arguments[LENGTH] === 0) {
				result = Object
					.keys(index)
					.map(function (_key) {
						return index[_key];
					});
			}
			else if (OBJECT_TOSTRING.call(key) === TOSTRING_REGEXP) {
				result = Object
					.keys(index)
					.filter(function (_key) {
						return key.test(_key);
					}).map(function (_key) {
						return index[_key];
					});
			}
			else {
				result = index[key];
			}

			return result;
		},

		/**
		 * Registers value with key
		 * @param {String} key Key
		 * @param {*} value Value
		 * @fires sig/register
		 * @return {*} value registered
		 */
		"register": function (key, value) {
			var me = this;
			var index = me[INDEX];
			var event;

			if (index[key] !== value) {

				if (index.hasOwnProperty(key)) {
					me.unregister(key);
				}

				event = {};
				event[TYPE] = SIG_REGISTER;
				event[RUNNER] = runner;

				me.emit(event, key, index[key] = value);
			}

			return value;
		},

		/**
		 * Un-registers key
		 * @param {String} key Key
		 * @fires sig/unregister
		 * @return {*} value unregistered
		 */
		"unregister": function (key) {
			var me = this;
			var index = me[INDEX];
			var value;
			var event;

			if (index.hasOwnProperty(key)) {

				value = index[key];

				if (delete index[key]) {
					event = {};
					event[TYPE] = SIG_UNREGISTER;
					event[RUNNER] = runner;

					me.emit(event, key, value);
				}
			}

			return value;
		}
	});
});
