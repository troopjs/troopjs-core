/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"../emitter/composition",
	"../config",
	"./executor",
	"troopjs-compose/decorator/from"
], function (Emitter, config, executor, from) {
	"use strict";

	/**
	 * A specialized version of {@link core.emitter.composition} for memorized events and {@link core.component.gadget#property-phase phase} protection.
	 *
	 * ## Memorized emitting
	 *
	 * A emitter event will memorize the "current" value of each event. Each executor may have it's own interpretation
	 * of what "current" means.
	 *
	 * @class core.pubsub.emitter
	 * @extend core.emitter.composition
	 */

	var UNDEFINED;
	var MEMORY = "memory";
	var HANDLERS = config.emitter.handlers;
	var EXECUTOR = config.emitter.executor;

	/**
	 * @method on
	 * @inheritdoc
	 * @private
	 */

	/**
	 * @method off
	 * @inheritdoc
	 * @private
	 */

	/**
	 * @method emit
	 * @inheritdoc
	 * @private
	 */

	return Emitter.extend((function (key, value) {
		var me = this;
		me[key] = value;
		return me;
	}).call({
		"displayName": "core/pubsub/emitter",

		/**
		 * Listen to an event that are emitted publicly.
		 * @chainable
		 * @inheritdoc #on
		 * @method
		 */
		"subscribe" : from("on"),

		/**
		 * Remove a public event listener.
		 * @chainable
		 * @inheritdoc #off
		 * @method
		 */
		"unsubscribe" : from("off"),

		/**
		 * Emit a public event that can be subscribed by other components.
		 *
		 * Handlers are run in a pipeline, in which each handler will receive muted
		 * data params depending on the return value of the previous handler:
		 *
		 *   - The original data params from {@link #publish} if this is the first handler, or the previous handler returns `undefined`.
		 *   - One value as the single argument if the previous handler return a non-array.
		 *   - Each argument value deconstructed from the returning array of the previous handler.
		 *
		 * @param {String} type The topic to publish.
		 * @param {...*} [args] Additional params that are passed to the handler function.
		 * @return {Promise}
		 */
		"publish" : from("emit"),

		/**
		 * Returns value in handlers MEMORY
		 * @param {String} type event type to peek at
		 * @param {*} [value] Value to use _only_ if no memory has been recorder
		 * @return {*} Value in MEMORY
		 */
		"peek": function (type, value) {
			var handlers;

			return (handlers = this[HANDLERS][type]) === UNDEFINED || !handlers.hasOwnProperty(MEMORY)
				? value
				: handlers[MEMORY];
		}
	}, EXECUTOR, executor));
});
