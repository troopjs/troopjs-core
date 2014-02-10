/*
 * TroopJS core/event/emitter
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([
	"../mixin/base",
	"./constants",
	"./config",
	"troopjs-utils/merge",
	"when"
], function EventEmitterModule(Base, CONSTANTS, CONFIG, merge, when) {
	"use strict";

	/**
	 * The event module of TroopJS that provides common event handling capability, and some highlights:
	 *
	 * ## Asynchronous handlers
	 * Any event handler can be asynchronous depending on the **return value**:
	 *
	 *  - a Promise value makes this handler be considered asynchronous, where the next handler will be called
	 *  upon the completion of this promise.
	 *  - any non-Promise values make it a ordinary handler, where the next handler will be invoked immediately.
	 *
	 * @class core.event.emitter
	 * @extends core.object.base
	 */

	var UNDEFINED;
	var NULL = null;
	var ARRAY_SLICE = Array.prototype.slice;
	var HANDLERS = CONSTANTS["handlers"];
	var RUNNER = CONSTANTS["runner"];
	var RUNNERS = CONSTANTS["runners"];
	var CONTEXT = CONSTANTS["context"];
	var CALLBACK = CONSTANTS["callback"];
	var DATA = CONSTANTS["data"];
	var HEAD = CONSTANTS["head"];
	var TAIL = CONSTANTS["tail"];
	var NEXT = CONSTANTS["next"];
	var MODIFIED = CONSTANTS["modified"];
	var PATTERN = CONSTANTS["pattern"];

	/*
	 * Internal runner that executes candidates in sequence without overlap
	 * @private
	 * @param {Object} handlers List of handlers
	 * @param {Array} candidates Array of candidates
	 * @param {Array} args Initial arguments
	 * @returns {Promise}
	 */
	function sequence(handlers, candidates, args) {
		var results = [];
		var resultsCount = 0;
		var candidatesCount = 0;

		/*
		 * Internal function for sequential execution of candidates
		 * @private
		 * @param {Array} [result] result from previous handler callback
		 * @param {Boolean} [skip] flag indicating if this result should be skipped
		 * @return {Promise} promise of next handler callback execution
		 */
		var next = function (result, skip) {
			/*jshint curly:false*/
			var candidate;

			// Store result if no skip
			if (skip !== true) {
				results[resultsCount++] = result;
			}

			// Return promise of next callback, or a promise resolved with result
			return (candidate = candidates[candidatesCount++]) !== UNDEFINED
				? when(candidate[CALLBACK].apply(candidate[CONTEXT], args), next)
				: when.resolve(results);
		};

		return next(args, true);
	}

	return Base.extend(function EventEmitter() {
		this[HANDLERS] = {};
	}, {
		"displayName" : "core/event/emitter",

		/**
		 * Adds a listener for the specified event.
		 * @param {String} event The event name to subscribe to.
		 * @param {Object} context The context to scope the {@param callback} to.
		 * @param {Function} callback The event listener function.
		 * @param {*} [data] Handler data
		 * @returns this
		 */
		"on" : function on(event, context, callback, data) {
			var me = this;
			var handlers = me[HANDLERS];
			var handler;

			// Get callback from next arg
			if (callback === UNDEFINED) {
				throw new Error("no callback provided");
			}

			// Have handlers
			if (event in handlers) {
				// Get handlers
				handlers = handlers[event];

				// Create new handler
				handler = {};

				// Prepare handler
				handler[CALLBACK] = callback;
				handler[CONTEXT] = context;
				handler[DATA] = data;

				// Set tail handler
				handlers[TAIL] = TAIL in handlers
					// Have tail, update handlers[TAIL][NEXT] to point to handler
					? handlers[TAIL][NEXT] = handler
					// Have no tail, update handlers[HEAD] to point to handler
					: handlers[HEAD] = handler;
			}
			// No handlers
			else {
				// Create event handlers
				handlers = handlers[event] = {};

				// Create head and tail
				handlers[HEAD] = handlers[TAIL] = handler = {};

				// Prepare handler
				handler[CALLBACK] = callback;
				handler[CONTEXT] = context;
				handler[DATA] = data;
			}

			// Set MODIFIED
			handlers[MODIFIED] = new Date().getTime();

			return me;
		},

		/**
		 * Remove listener(s) from a subscribed event, if no listener is specified,
		 * remove all listeners of this event.
		 *
		 * @param {String} event The event that the listener subscribes to.
		 * @param {Object} [context] The context to scope the {@param callback} to remove.
		 * @param {Function} [callback] The event listener function to remove.
		 * @returns this
		 */
		"off" : function off(event, context, callback) {
			var me = this;
			var handlers = me[HANDLERS];
			var handler;
			var head;
			var tail;

			// Have handlers
			if (event in handlers) {
				// Get handlers
				handlers = handlers[event];

				// Have HEAD in handlers
				if (HEAD in handlers) {
					// Get first handler
					handler = handlers[HEAD];

					// Iterate handlers
					do {
						// Should we remove?
						remove : {
							// If no context or context does not match we should break
							if (context && handler[CONTEXT] !== context) {
								break remove;
							}

							// If no callback or callback does not match we should break
							if (callback && handler[CALLBACK] !== callback) {
								break remove;
							}

							// Remove this handler, just continue
							continue;
						}

						// It there's no head - link head -> tail -> handler
						if (!head) {
							head = tail = handler;
						}
						// Otherwise just link tail -> tail[NEXT] -> handler
						else {
							tail = tail[NEXT] = handler;
						}
					}
						// While there's a next handler
					while ((handler = handler[NEXT]));

					// If we have both head and tail we should update handlers
					if (head && tail) {
						// Set handlers HEAD and TAIL
						handlers[HEAD] = head;
						handlers[TAIL] = tail;

						// Make sure to remove NEXT from tail
						delete tail[NEXT];
					}
					// Otherwise we remove the handlers list
					else {
						delete handlers[HEAD];
						delete handlers[TAIL];
					}
				}

				// Set MODIFIED
				handlers[MODIFIED] = new Date().getTime();
			}

			return me;
		},

		/**
		 * Trigger an event which notifies each of the listeners of their subscribing,
		 * optionally pass data values to the listeners.
		 *
		 * ## Emit runners
		 * {@link core.event.emitter#runners} defines runners that determinate how the handler functions are to be executed,
		 * which can be overridden by sub classes which could define it's own preference for handlers execution.
		 *
		 *  A sequential runner, is the default runner for this module, in which all handlers are running
		 *  with the same argument data specified by the {@link #emit} function.
		 *  Each handler will wait for the completion for the previous one if it returns a promise.
		 *
		 * @param {String} event The event name to emit
		 * @param {...*} [args] Data params that are passed to the listener function.
		 * @returns {Promise} promise Promise of the return values yield from the listeners at all.
		 */
		"emit" : function emit(event, args) {
			var me = this;
			var handlers = me[HANDLERS];
			var handler;
			var runners = me[RUNNERS];
			var runner = me[RUNNER];
			var candidates = [];
			var candidatesCount = 0;
			var matches;

			// See if we should override event and runner
			if ((matches = PATTERN.exec(event)) !== NULL) {
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

				// Have HEAD in handlers
				if (HEAD in handlers) {
					// Get first handler
					handler = handlers[HEAD];

					// Step handlers
					do {
						// Push handler on candidates
						candidates[candidatesCount++] = handler;
					}
					// While there is a next handler
					while ((handler = handler[NEXT]));
				}
			}
			// No event in handlers
			else {
				// Create handlers and store with event
				handlers[event] = handlers = {};
			}

			// Return promise
			return runner.call(me, handlers, candidates, ARRAY_SLICE.call(arguments, 1));
		}
	}, (function () {
		var result = {};

		// Set default runner
		result[RUNNER] = CONFIG[RUNNER];

		// Set available runners
		result[RUNNERS] = merge.call({}, {
			"sequence": sequence
		}, CONFIG[RUNNERS]);

		return result;
	})());
});
