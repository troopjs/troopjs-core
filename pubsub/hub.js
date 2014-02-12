/*
 * TroopJS core/pubsub/hub
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([
	"../event/emitter",
	"./runner/pipeline"
], function HubModule(Emitter, pipeline) {
	"use strict";

	/**
	 * The centric "bus" that handlers publishing and subscription.
	 *
	 * ## Memorized emitting
	 * A fired event will memorize the "current" value of each event. Each executor may have it's own interpretation
	 * of what "current" means.
	 *
	 * For listeners that are registered after the event emitted thus missing from the call, {@link #republish} will
	 * compensate the call with memorized data.
	 *
	 * **Note:** It's NOT necessarily to pub/sub on this module, prefer to
	 * use methods like {@link core.component.gadget#publish} and {@link core.component.gadget#subscribe}
	 * that are provided as shortcuts.
	 *
	 * @class core.pubsub.hub
	 * @singleton
	 * @extends core.event.emitter
	 */

	var COMPONENT_PROTOTYPE = Emitter.prototype;
	var OBJECT_TOSTRING = Object.prototype.toString;
	var STRING_TOSTRING = "[object String]";
	var MEMORY = "memory";
	var HANDLERS = "handlers";
	var RUNNER = "runner";
	var TYPE = "type";

	return Emitter.create({
		"displayName": "core/pubsub/hub",

		/**
		 * Listen to an event that are emitted publicly.
		 * @inheritdoc #on
		 * @method
		 */
		"subscribe" : COMPONENT_PROTOTYPE.on,

		/**
		 * Remove a public event listener.
		 * @inheritdoc #off
		 * @method
		 */
		"unsubscribe" : COMPONENT_PROTOTYPE.off,

		/**
		 * Emit a public event that can be subscribed by other components.
		 *
		 * Publish uses a pipelined runner by default, in which each handler will receive muted
		 * data params depending on the return value of the previous handler:
		 *
		 *   - The original data params from {@link #publish} if this's the first handler, or the previous handler returns `undefined`.
		 *   - One value as the single argument if the previous handler return a non-array.
		 *   - Each argument value deconstructed from the returning array of the previous handler.
		 *
		 * @inheritdoc #emit
		 * @method
		 */
		"publish" : function publish(event, args) {
			var me = this;
			var type = event;

			// If event is a plain string, convert to object with props
			if (OBJECT_TOSTRING.call(event) === STRING_TOSTRING) {
				event = {};
				event[TYPE] = type;
				event[RUNNER] = pipeline;
			}
			// If event duck-types an event object we just override or use defaults
			else if (TYPE in event) {
				event[RUNNER] = event[RUNNER] || pipeline;
			}

			// Modify first argument
			arguments[0] = event;

			// Emit
			return me.emit.apply(me, arguments);
		},

		/**
		 * Returns value in handlers MEMORY
		 * @param {String} type event type to peek at
		 * @returns {*} Value in MEMORY
		 */
		"peek": function peek(type) {
			var me = this;
			var handlers = me[HANDLERS];
			var result;

			if (type in handlers) {
				handlers = handlers[type];

				if (MEMORY in handlers) {
					result = handlers[MEMORY];
				}
			}

			return result;
		}
	});
});
