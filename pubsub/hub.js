/*
 * TroopJS core/pubsub/hub
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([
	"../event/emitter",
	"../event/constants",
	"./config",
	"troopjs-utils/merge",
	"when"
], function HubModule(Emitter, CONSTANTS, CONFIG, merge, when) {
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

	var UNDEFINED;
	var NULL = null;
	var COMPONENT_PROTOTYPE = Emitter.prototype;
	var OBJECT_TOSTRING = Object.prototype.toString;
	var TOSTRING_ARGUMENTS = "[object Arguments]";
	var TOSTRING_ARRAY = "[object Array]";
	var LENGTH = "length";
	var MEMORY = "memory";
	var PHASE = "phase";
	var HEAD = CONSTANTS["head"];
	var NEXT = CONSTANTS["next"];
	var CONTEXT = CONSTANTS["context"];
	var CALLBACK = CONSTANTS["callback"];
	var HANDLERS = CONSTANTS["handlers"];
	var RUNNER = CONSTANTS["runner"];
	var RUNNERS = CONSTANTS["runners"];
	var RE_PATTERN = CONSTANTS["pattern"];
	var RE_PHASE = /^(?:initi|fin)alized?$/;

	/*
	 * Internal runner that executes candidates in sequence without overlap
	 * @private
	 * @param {Object} handlers List of handlers
	 * @param {Array} candidates Array of candidates
	 * @param {Array} args Initial arguments
	 * @returns {Promise}
	 */
	function hub_sequence(handlers, candidates, args) {
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
				? when(candidate[CALLBACK].apply(context, args), next)
				: (handlers[MEMORY] = args) === args && when.resolve(results);
		};

		return next(args, true);
	}

	/*
	 * Internal runner that executes candidates in pipeline without overlap
	 * @private
	 * @param {Object} handlers List of handlers
	 * @param {Array} candidates Array of candidates
	 * @param {Array} args Initial arguments
	 * @returns {Promise}
	 */
	function hub_pipeline(handlers, candidates, args) {
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
			var type;
			var length;

			// Check that result is not UNDEFINED and not equals to args
			if (result !== UNDEFINED && result !== args) {
				// Update args to either result or result wrapped in a new array
				args = (type = OBJECT_TOSTRING.call(result)) === TOSTRING_ARRAY  // if type is TOSTRING_ARRAY
					|| type === TOSTRING_ARGUMENTS                                 // or type is TOSTRING_ARGUMENTS
					? result                                                       // then result is array-like enough to be passed to .apply
					: [ result ];                                                  // otherwise we should just wrap it in a new array
			}

			// TODO Needs cleaner implementation
			// Iterate until we find a candidate in a blocked phase
			while ((candidate = candidates[candidatesCount++]) // Has next candidate
				&& (context = candidate[CONTEXT])                // Has context
				&& RE_PHASE.test(context[PHASE]));               // In blocked phase

			// Return promise of next callback, or promise resolved with args
			return candidate !== UNDEFINED
				? when(candidate[CALLBACK].apply(context, args), next)
				: when.resolve(handlers[MEMORY] = args);
		};

		return next(args);
	}

	return Emitter.create({
		"displayName": "core/pubsub/hub",

		/**
		 * List of event handler runners that execute the subscribers when calling the {@link #publish} method.
		 *
		 * - hub_pipeline (default)
		 * - hub_sequence
		 * @property runners
		 */

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
		 * The hub implements two runners for its handlers execution, the **sequential** is basically inherited from the
		 * emitter parent. Additionally it's using a pipelined runner by default, in which each handler will receive muted
		 * data params depending on the return value of the previous handler:
		 *
		 *   - The original data params from {@link #publish} if this's the first handler, or the previous handler returns `undefined`.
		 *   - One value as the single argument if the previous handler return a non-array.
		 *   - Each argument value deconstructed from the returning array of the previous handler.
		 *
		 * @inheritdoc #emit
		 * @method
		 */
		"publish" : COMPONENT_PROTOTYPE.emit,

		/**
		 * Re-publish any event that are **previously triggered**, any (new) listeners will be called with the memorized data
		 * from the previous event publishing procedure.
		 *
		 * @param {String} event The event name to re-publish, dismiss if it's not yet published.
		 * @param {Object} [context] The context to scope the {@param callback} to match.
		 * @param {Function} [callback] The listener function to match.
		 * @returns {Promise}
		 */
		"republish" : function republish(event, context, callback) {
			var me = this;
			var handlers = me[HANDLERS];
			var handler;
			var runners = me[RUNNERS];
			var runner = me[RUNNER];
			var candidates = [];
			var candidatesCount = 0;
			var matches;

			// See if we should override event and runner
			if ((matches = RE_PATTERN.exec(event)) !== NULL) {
				event = matches[1];
				runner = matches[2];
			}

			// Have runner in runners
			if (runner in runners) {
				runner = runners[runner];
			}
			// Unknown runner
			else {
				throw new Error("Unknown runner '" + runner + "'");
			}

			// Have event in handlers
			if (event in handlers) {
				// Get handlers
				handlers = handlers[event];

				// Short out to return a resolved promise if there's no memory yet.
				if(!(MEMORY in handlers)) {
					return when.resolve();
				}

				if (HEAD in handlers) {
					// Get first handler
					handler = handlers[HEAD];

					// Iterate handlers
					do {
						add : {
							// If no context or context does not match we should break
							if (context && handler[CONTEXT] !== context) {
								break add;
							}

							// If no callback or callback does not match we should break
							if (callback && handler[CALLBACK] !== callback) {
								break add;
							}

							// Push handler on candidates
							candidates[candidatesCount++] = handler;
						}
					}
						// While there's a next handler
					while ((handler = handler[NEXT]));
				}
			}
			// No event in handlers
			else {
				// Create handlers and store with event
				handlers[event] = handlers = {};
			}

			// Return promise
			return runner.call(me, handlers, candidates, handlers[MEMORY]);
		},

		/**
		 * Returns value in handlers MEMORY
		 * @param {String} event to peek at
		 * @returns {*} Value in MEMORY
		 */
		"peek": function peek(event) {
			var me = this;
			var handlers = me[HANDLERS];
			var result;

			if (event in handlers) {
				handlers = handlers[event];

				if (MEMORY in handlers) {
					result  = handlers[MEMORY];
				}
			}

			return result;
		}
	}, (function(runner, runners) {
		var result = {};

		// Update default runner from either config or prototype
		result[RUNNER] = CONFIG[RUNNER] || runner;

		// Merge runners from self, prototype and config
		result[RUNNERS] = merge.call({}, runners, {
			"hub_pipeline": hub_pipeline,
			"hub_sequence": hub_sequence
		}, CONFIG[RUNNERS]);

		return result;
	})(COMPONENT_PROTOTYPE[RUNNER], COMPONENT_PROTOTYPE[RUNNERS]));
});
