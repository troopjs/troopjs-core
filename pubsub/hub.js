/**
 * TroopJS core/pubsub/hub
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([ "../event/emitter", "when" ], function HubModule(Emitter, when) {
	"use strict";

	/**
	 * The centric "bus" that handlers publishing and subscription.
	 *
	 * **Note:** It's NOT necessarily to pub/sub on this module, prefer to
	 * use methods like {@link core.component.gadget#publish} and {@link core.component.gadget#subscribe}
	 * that are provided as shortcuts.
	 *
	 * @class core.pubsub.hub
	 * @singleton
	 * @extends core.event.emitter
	 */

	var UNDEFINED;
	var COMPONENT_PROTOTYPE = Emitter.prototype;
	var CONTEXT = "context";
	var CALLBACK = "callback";
	var HANDLED = "handled";
	var MEMORY = "memory";
	var PHASE = "phase";
	var RE_PHASE = /^(?:initi|fin)alized?$/;

	/*
	 * Constructs a function that executes handlers in sequence without overlap
	 * @param {Array} handlers Array of handlers
	 * @param {Number} handled Handled counter
	 * @param {Array} args Initial arguments
	 * @returns {Function}
	 */
	function sequence(handlers, handled, args) {
		var results = [];
		var resultsCount = 0;
		var handlersCount = 0;

		/*
		 * Internal function for sequential execution of handlers handlers
		 * @private
		 * @param {Array} [result] result from previous handler callback
		 * @param {Boolean} [skip] flag indicating if this result should be skipped
		 * @return {Promise} promise of next handler callback execution
		 */
		var next = function (result, skip) {
			/*jshint curly:false*/
			var handler;
			var context;

			// Store result if no skip
			if (skip !== true) {
				results[resultsCount++] = result;
			}

			// TODO Needs cleaner implementation
			// Iterate handlers while handler has a context and that context is in a blocked phase
			while ((handler = handlers[handlersCount++]) // Has next handler
				&& (context = handler[CONTEXT])            // Has context
				&& RE_PHASE.test(context[PHASE]));         // In blocked phase

			// Return promise of next callback, or a promise resolved with result
			return handler !== UNDEFINED
				? (handler[HANDLED] = handled) === handled && when(handler[CALLBACK].apply(context, args), next)
				: when.resolve(results);
		};

		return next(args, true);
	}

	/*
	 * Constructs a function that executes handlers in a pipeline without overlap
	 * @private
	 * @param {Array} handlers Array of handlers
	 * @param {Number} handled Handled counter
	 * @param {Array} args Initial arguments
	 * @returns {Function}
	 */
	function pipeline(handlers, handled, args) {
		var me = this;
		var handlersCount = 0;

		/*
		 * Internal function for piped execution of handlers handlers
		 * @private
		 * @param {Array} [result] result from previous handler callback
		 * @return {Promise} promise of next handler callback execution
		 */
		var next = function (result) {
			/*jshint curly:false*/
			var context;
			var handler;

			// Check that we have result
			if (result !== UNDEFINED) {
				// Update memory and args
				me[MEMORY] = args = result;
			}

			// TODO Needs cleaner implementation
			// Iterate until we find a handler in a blocked phase
			while ((handler = handlers[handlersCount++]) // Has next handler
				&& (context = handler[CONTEXT])            // Has context
				&& RE_PHASE.test(context[PHASE]));         // In blocked phase

			// Return promise of next callback, or promise resolved with args
			return handler !== UNDEFINED
				? (handler[HANDLED] = handled) === handled && when(handler[CALLBACK].apply(context, args), next)
				: when.resolve(args);
		};

		return next(args);
	}

	return Emitter.create({
		"displayName": "core/pubsub/hub",

		"runners" : {
			"pipeline": pipeline,
			"sequence": sequence,
			"default": pipeline
		},

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
		 * @inheritdoc #emit
		 * @method
		 */
		"publish" : COMPONENT_PROTOTYPE.emit,

		/**
		 * Re-emit a public event.
		 * @inheritdoc #reemit
		 * @method
		 */
		"republish" : COMPONENT_PROTOTYPE.reemit,

		/**
		 * Spy on the current value stored for a topic
		 * @inheritdoc #peek
		 * @method
		 */
		"spy" : COMPONENT_PROTOTYPE.peek
	});
});
