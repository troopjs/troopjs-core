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
	 * @private
	 * @param {Object} handlers List of handlers
	 * @param {Array} candidates Array of candidates
	 * @param {Number} handled Handled counter
	 * @param {Array} args Initial arguments
	 * @returns {Promise}
	 */
	function sequence(handlers, candidates, handled, args) {
		var results = [];
		var resultsCount = 0;
		var candidatesCount = 0;

		/*
		 * Internal function for sequential execution of candidates candidates
		 * @private
		 * @param {Array} [result] result from previous handler callback
		 * @param {Boolean} [skip] flag indicating if this result should be skipped
		 * @return {Promise} promise of next handler callback execution
		 */
		var next = function (result, skip) {
			/*jshint curly:false*/
			var candidate;
			var context;

			// Store result if no skip
			if (skip !== true) {
				results[resultsCount++] = result;
			}

			// TODO Needs cleaner implementation
			// Iterate candidates while candidate has a context and that context is in a blocked phase
			while ((candidate = candidates[candidatesCount++]) // Has next candidate
				&& (context = candidate[CONTEXT])                // Has context
				&& RE_PHASE.test(context[PHASE]));               // In blocked phase

			// Return promise of next callback, or a promise resolved with result
			return candidate !== UNDEFINED
				? (candidate[HANDLED] = handled) === handled && when(candidate[CALLBACK].apply(context, args), next)
				: (handlers[MEMORY] = args) === args && when.resolve(results);
		};

		return next(args, true);
	}

	/*
	 * Constructs a function that executes handlers in a pipeline without overlap
	 * @private
	 * @param {Object} handlers List of handlers
	 * @param {Array} candidates Array of candidates
	 * @param {Number} handled Handled counter
	 * @param {Array} args Initial arguments
	 * @returns {Promise}
	 */
	function pipeline(handlers, candidates, handled, args) {
		var candidatesCount = 0;

		/*
		 * Internal function for piped execution of candidates candidates
		 * @private
		 * @param {Array} [result] result from previous handler callback
		 * @return {Promise} promise of next handler callback execution
		 */
		var next = function (result) {
			/*jshint curly:false*/
			var context;
			var candidate;

			// Check that we have result
			if (result !== UNDEFINED) {
				// Update args
				args = result;
			}

			// TODO Needs cleaner implementation
			// Iterate until we find a candidate in a blocked phase
			while ((candidate = candidates[candidatesCount++]) // Has next candidate
				&& (context = candidate[CONTEXT])                // Has context
				&& RE_PHASE.test(context[PHASE]));               // In blocked phase

			// Return promise of next callback, or promise resolved with args
			return candidate !== UNDEFINED
				? (candidate[HANDLED] = handled) === handled && when(candidate[CALLBACK].apply(context, args), next)
				: when.resolve(handlers[MEMORY] = args);
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
