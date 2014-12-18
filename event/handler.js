/**
 * @license MIT http://troopjs.mit-license.org/
 */
define(function () {

	/**
	 * @class core.event.handler
	 * @private
	 */

	/**
	 * Handler emitter
	 * @property {core.event.emitter} emitter
	 */

	/**
	 * Handler type
	 * @property {String} type
	 */

	/**
	 * Handler data
	 * @property {*} data
	 */

	/**
	 * Handler callback
	 * @property {Function} callback
	 */

	/**
	 * Handler context
	 * @property {core.event.emitter} context
	 */

	/**
	 * Handler limit
	 * @property {Number} limit
	 */

	/**
	 * Handler count
	 * @property {Number} count
	 */

	/**
	 * Handler `on` callback
	 * @property {Function} on
	 */

	/**
	 * Handler `off` callback
	 * @property {Function} off
	 */

	var OBJECT_TOSTRING = Object.prototype.toString;
	var TOSTRING_FUNCTION = "[object Function]";
	var EMITTER = "emitter";
	var CONTEXT = "context";
	var CALLBACK = "callback";
	var TYPE = "type";
	var LIMIT = "limit";
	var COUNT = "count";
	var DATA = "data";
	var ON = "on";
	var OFF = "off";

	/**
	 * Creates new handler
	 * @param {core.event.emitter} emitter Emitter that owns this handler
	 * @param {String} type Type for this handler
	 * @param {Function} callback Callback for this handler
	 * @param {*} [data] Data for this handler
	 * @method constructor
	 */
	function Handler(emitter, type, callback, data) {
		var me = this;

		me[EMITTER] = emitter;
		me[TYPE] = type;
		me[DATA] = data;

		if (OBJECT_TOSTRING.call(callback) === TOSTRING_FUNCTION) {
			me[CALLBACK] = callback;
			me[CONTEXT] = emitter;
		}
		else {
			me[CALLBACK] = callback[CALLBACK];
			me[CONTEXT] = callback[CONTEXT] || emitter;

			if (callback.hasOwnProperty(LIMIT)) {
				me[LIMIT] = callback[LIMIT];
				me[COUNT] = 0;
			}
			if (callback.hasOwnProperty(ON)) {
				me[ON] = callback[ON];
			}
			if (callback.hasOwnProperty(OFF)) {
				me[OFF] = callback[OFF];
			}
		}
	}

	/**
	 * Executes {@link #callback} and does some house keeping.
	 * @param {Array} args Handler arguments
	 */
	Handler.prototype.run = function (args) {
		// Let `me` be `this`
		var me = this;

		// Get result from execution of `handler[CALLBACK]`
		var result = me[CALLBACK].apply(me[CONTEXT], args);

		// If there's a `me[LIMIT]` and `++me[COUNT]` is greater or equal to it ...
		if (LIMIT in me && ++me[COUNT] >= me[LIMIT]) {
			// ... `me[EMITTER].off` `me` (note that `me[CALLBACK]` and `me[CONTEXT]` are used by `.off`)
			me[EMITTER].off(me[TYPE], me);
		}

		return result;
	};

	return Handler;
});