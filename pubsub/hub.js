/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"../event/emitter",
	"./runner/pipeline",
	"troopjs-compose/decorator/from"
], function HubModule(Emitter, pipeline, from) {
	"use strict";

	/**
	 * The centric "bus" that handlers publishing and subscription.
	 *
	 * ## Memorized emitting
	 * A fired event will memorize the "current" value of each event. Each executor may have it's own interpretation
	 * of what "current" means.
	 *
	 * **Note:** It's NOT necessarily to pub/sub on this module, prefer to
	 * use methods like {@link core.component.gadget#publish publish} and {@link core.component.gadget#subscribe subscribe}
	 * that are provided as shortcuts.
	 *
	 * @class core.pubsub.hub
	 * @extend core.event.emitter
	 * @singleton
	 */

	var UNDEFINED;
	var ARRAY_SLICE = Array.prototype.slice;
	var MEMORY = "memory";
	var HANDLERS = "handlers";
	var RUNNER = "runner";
	var TYPE = "type";

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

	return Emitter.create({
		"displayName": "core/pubsub/hub",

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
		"publish" : function publish(type) {
			var me = this;

			// Prepare event object
			var event = {};
			event[TYPE] = type;
			event[RUNNER] = pipeline;

			// Slice `arguments`
			var args = ARRAY_SLICE.call(arguments);

			// Modify first `arg`
			args[0] = event;

			// Delegate the actual emitting to event emitter.
			return me.emit.apply(me, args);
		},

		/**
		 * Returns value in handlers MEMORY
		 * @param {String} type event type to peek at
		 * @param {*} [value] Value to use _only_ if no memory has been recorder
		 * @return {*} Value in MEMORY
		 */
		"peek": function peek(type, value) {
			var handlers;

			return (handlers = this[HANDLERS][type]) === UNDEFINED || !(MEMORY in handlers)
				? value
				: handlers[MEMORY];
		}
	});
});
