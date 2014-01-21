/*
 * TroopJS core/event/emitter
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([
	"../object/base",
	"when",
	"poly/array"
], function EventEmitterModule(Base, when) {
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
	 * ## Mutable event data
	 * Additional event data can be passed to listeners when calling @{link #emit}, which can be further altered by the
	 * returning value of the handler, depending on **event type** we're emitting:
	 *
	 *  - **foo[:pipleline]** (default) In a piplelined event, handler shall return **an array** of params, that is the input for the next handler.
	 *  - **foo:sequence**  In a sequential event, handler shall return **a single** param, that is appended to a list of params, that forms
	 *  the input for the next handler.
	 *
	 *  On the caller side, the return value of the {@link #emit} or {@link #reemit} call also depends on the event type described above:
	 *
	 *  - **foo[:pipleline]** (default) In a piplelined event, it will be **one value** that is the return value from the last handler.
	 *  - **foo:sequence**  In a sequential event, it will be **an array** that accumulated the return value from all of the handlers.
	 *
	 * ## Memorized emitting
	 * A fired event will memorize the event data yields from the last handler, for listeners that are registered
	 * after the event emitted that thus missing from the call, {@link #reemit} will compensate the call with memorized data.
	 *
	 * @class core.event.emitter
	 * @extends core.object.base
	 */

	var UNDEFINED;
	var NULL = null;
	var DEFAULT = "default";
	var MEMORY = "memory";
	var CONTEXT = "context";
	var CALLBACK = "callback";
	var LENGTH = "length";
	var HEAD = "head";
	var TAIL = "tail";
	var NEXT = "next";
	var HANDLED = "handled";
	var HANDLERS = "handlers";
	var RUNNERS = "runners";
	var RE_RUNNER = /^(.+)(?::(\w+))/;
	var ARRAY_SLICE = Array.prototype.slice;

	/*
	 * Internal runner that executes handlers in sequence without overlap
	 * @private
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

			// Store result if no skip
			if (skip !== true) {
				results[resultsCount++] = result;
			}

			// Return promise of next callback, or a promise resolved with result
			return (handler = handlers[handlersCount++]) !== UNDEFINED
				? (handler[HANDLED] = handled) === handled && when(handler[CALLBACK].apply(handler[CONTEXT], args), next)
				: when.resolve(results);
		};

		return next(args, true);
	}

	return Base.extend(function EventEmitter() {
		this[HANDLERS] = {};
	}, {
		"displayName" : "core/event/emitter",

		"runners" : {
			"sequence": sequence,
			"default": sequence
		},

		/**
		 * Adds a listener for the specified event.
		 * @param {String} event The event name to subscribe to.
		 * @param {Object} context The context to scope callbacks to.
		 * @param {Function} callback The event listener function.
		 * @returns this
		 */
		"on" : function on(event, context, callback) {
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

				// Set handler callback
				handler[CALLBACK] = callback;

				// Set handler context
				handler[CONTEXT] = context;

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

				// Set HANDLED
				handlers[HANDLED] = 0;

				// Create head and tail
				handlers[HEAD] = handlers[TAIL] = handler = {};

				// Set handler callback
				handler[CALLBACK] = callback;

				// Set handler context
				handler[CONTEXT] = context;
			}

			return me;
		},

		/**
		 * Remove listener(s) from a subscribed event, if no listener is specified,
		 * remove all listeners of this event.
		 *
		 * @param {String} event The event that the listener subscribes to.
		 * @param {Object} [context] The context that bind to the listener.
		 * @param {Function...} [callback] One more more callback listeners to remove.
		 * @returns this
		 */
		"off" : function off(event, context, callback) {
			var me = this;
			var args = arguments;
			var argsLength = args[LENGTH];
			var handlers = me[HANDLERS];
			var handler;
			var head;
			var tail;
			var offset;
			var found;

			// Return fast if we don't have subscribers
			if (!(event in handlers)) {
				return me;
			}

			// Get handlers
			handlers = handlers[event];

			// Return fast if there's no HEAD
			if (!(HEAD in handlers)) {
				return me;
			}

			// Get first handler
			handler = handlers[HEAD];

			// Iterate handlers
			do {
				// Should we remove?
				remove : {
					// If no context or context does not match we should break
					if (context && handler[CONTEXT] && handler[CONTEXT] !== context) {
						break remove;
					}

					// Reset offset, then loop callbacks
					for (found = false, offset = 2; offset < argsLength; offset++) {
						// If handler CALLBACK matches update found and break
						if (handler[CALLBACK] === args[offset]) {
							found = true;
							break;
						}
					}

					// If nothing is found break
					if (!found) {
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

			return me;
		},

		/**
		 * Trigger an event which notifies each of the listeners in sequence of their subscribing,
		 * optionally pass data values to the listeners.
		 *
		 * @param {String} event The event name to emit
		 * @param {Mixed...} [args] Data params that are passed to the listener function.
		 * @returns {Promise} promise Promise of the return values yield from the listeners at all.
		 */
		"emit" : function emit(event) {
			var me = this;
			var args = ARRAY_SLICE.call(arguments, 1);
			var handlers = me[HANDLERS];
			var handler;
			var runners = me[RUNNERS];
			var runner = runners[DEFAULT];
			var candidates;
			var candidatesCount;
			var matches;

			// See if we should override event and runner
			if ((matches = RE_RUNNER.exec(event)) !== NULL) {
				event = matches[1];

				if ((runner = runners[matches[2]]) === UNDEFINED) {
					throw new Error("unknown runner " + matches[2]);
				}
			}

			// Have event in handlers
			if (event in handlers) {
				// Get handlers
				handlers = handlers[event];

				// Have head in handlers
				if (HEAD in handlers) {
					// Create candidates array and count
					candidates = [];
					candidatesCount = 0;

					// Get first handler
					handler = handlers[HEAD];

					// Step handlers
					do {
						// Push handler on candidates
						candidates[candidatesCount++] = handler;
					}
					// While there is a next handler
					while ((handler = handler[NEXT]));

					// Return promise
					return runner.call(handlers, candidates, ++handlers[HANDLED], args);
				}
			}
			// No event in handlers
			else {
				// Create handlers and store with event
				handlers[event] = handlers = {};

				// Set handled
				handlers[HANDLED] = 0;
			}

			// Remember arg
			handlers[MEMORY] = args;

			// Return promise resolved with arg
			return when.resolve(args);
		},

		/**
		 * Re-emit any event that are **previously triggered**, any (new) listeners will be called with the memorized data
		 * from the previous event emitting procedure.
		 *
		 * 	// start widget1 upon the app loaded.
		 * 	app.on('load', function(url) {
		 * 		widget1.start(url);
		 * 	});
		 *
		 * 	// Emits the load event on app.
		 * 	app.emit('load', window.location.hash);
		 *
		 * 	// start of widget2 comes too late for the app start.
		 * 	app.on('load', function(url) {
		 * 		// Widget should have with the same URL as with widget1.
		 * 		widget2.start(url);
		 * 	});
		 *
		 * 	$.ready(function() {
		 * 		// Compensate the "load" event listeners that are missed.
		 * 		app.reemit();
		 * 	});
		 *
		 * @param {String} event The event name to re-emit, dismiss if it's the first time to emit this event.
		 * @param {Boolean} senile=false Whether to trigger listeners that are already handled in previous emitting.
		 * @param {Object} [context] The context object to scope this re-emitting.
		 * @param {Function...} [callback] One or more specific listeners that should be affected in the re-emitting.
		 * @returns this
		 */
		"reemit" : function reemit(event, senile, context, callback) {
			var me = this;
			var args = arguments;
			var argsLength = args[LENGTH];
			var handlers = me[HANDLERS];
			var handler;
			var handled;
			var runners = me[RUNNERS];
			var runner = runners[DEFAULT];
			var candidates;
			var candidatesCount;
			var matches;
			var offset;
			var found;

			// See if we should override event and runner
			if ((matches = RE_RUNNER.exec(event)) !== NULL) {
				event = matches[1];

				if ((runner = runners[matches[2]]) === UNDEFINED) {
					throw new Error("unknown runner " + matches[2]);
				}
			}

			// Have event in handlers
			if (event in handlers) {
				// Get handlers
				handlers = handlers[event];

				// Have memory in handlers
				if (MEMORY in handlers) {
					// If we have no HEAD we can return a promise resolved with memory
					if (!(HEAD in handlers)) {
						return when.resolve(handlers[MEMORY]);
					}

					// Create candidates array and count
					candidates = [];
					candidatesCount = 0;

					// Get first handler
					handler = handlers[HEAD];

					// Get handled
					handled = handlers[HANDLED];

					// Iterate handlers
					do {
						add : {
							// If no context or context does not match we should break
							if (context && handler[CONTEXT] && handler[CONTEXT] !== context) {
								break add;
							}

							// Reset found and offset, iterate args
							for (found = false, offset = 3; offset < argsLength; offset++) {
								// If callback matches set found and break
								if (handler[CALLBACK] === args[offset]) {
									found = true;
									break;
								}
							}

							// If we found a callback and are already handled and not senile break add
							if (found && handler[HANDLED] === handled && !senile) {
								break add;
							}

							// Push handler on candidates
							candidates[candidatesCount++] = handler;
						}
					}
					// While there's a next handler
					while ((handler = handler[NEXT]));

					// Return promise
					return runner.call(handlers, candidates, handled, handlers[MEMORY]);
				}
			}

			// Return resolved promise
			return when.resolve();
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
	});
});
