/**
 * TroopJS core/event/emitter
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define([ "../component/base", "when" ], function EventEmitterModule(Component, when) {
	/*jshint laxbreak:true */

	var MEMORY = "memory";
	var CONTEXT = "context";
	var CALLBACK = "callback";
	var LENGTH = "length";
	var HEAD = "head";
	var TAIL = "tail";
	var NEXT = "next";
	var HANDLED = "handled";
	var HANDLERS = "handlers";
	var RE = /^(\w+)(?::(pipeline|sequence))/;

	return Component.extend(
	/**
	 * Creates a new EventEmitter
	 * @constructor
	 */
	function EventEmitter() {
		this[HANDLERS] = {};
	}, {
		"displayName" : "core/event/emitter",

		/**
		 * Adds a listener for the specified event.
		 * @param {String} event to subscribe to
		 * @param {Object} context to scope callbacks to
		 * @param {...Function} callback for this event
		 * @returns {Object} instance of this
		 */
		"on" : function on(event, context, callback) {
			var self = this;
			var args = arguments;
			var handlers = self[HANDLERS];
			var handler;
			var head;
			var tail;
			var length = args[LENGTH];
			var offset = 2;

			// Have handlers
			if (event in handlers) {
				// Get handlers
				handlers = handlers[event];

				// Create new handler
				handler = {};

				// Set handler callback to next arg from offset
				handler[CALLBACK] = args[offset++];

				// Set handler context
				handler[CONTEXT] = context;

				// Get tail handler
				tail = TAIL in handlers
					// Have tail, update handlers[TAIL][NEXT] to point to handler
					? handlers[TAIL][NEXT] = handler
					// Have no tail, update handlers[HEAD] to point to handler
					: handlers[HEAD] = handler;

				// Iterate handlers from offset
				while (offset < length) {
					// Set tail -> tail[NEXT] -> handler
					tail = tail[NEXT] = handler = {};

					// Set handler callback to next arg from offset
					handler[CALLBACK] = args[offset++];

					// Set handler context
					handler[CONTEXT] = context;
				}

				// Set tail handler
				handlers[TAIL] = tail;
			}
			// No handlers
			else {
				// Create head and tail
				head = tail = handler = {};

				// Set handler callback to next arg from offset
				handler[CALLBACK] = args[offset++];

				// Set handler context
				handler[CONTEXT] = context;

				// Iterate handlers from offset
				while (offset < length) {
					// Set tail -> tail[NEXT] -> handler
					tail = tail[NEXT] = handler = {};

					// Set handler callback to next arg from offset
					handler[CALLBACK] = args[offset++];

					// Set handler context
					handler[CONTEXT] = context;
				}

				// Create event handlers
				handlers = handlers[event] = {};

				// Initialize event handlers
				handlers[HEAD] = head;
				handlers[TAIL] = tail;
				handlers[HANDLED] = 0;
			}

			return self;
		},

		/**
		 * Remove a listener for the specified event.
		 * @param {String} event to remove callback from
		 * @param {Object} context to scope callback to
		 * @param {...Function} [callback] to remove
		 * @returns {Object} instance of this
		 */
		"off" : function off(event, context, callback) {
			var self = this;
			var args = arguments;
			var handlers = self[HANDLERS];
			var handler;
			var head;
			var tail;
			var length = args[LENGTH];
			var offset;

			// Return fast if we don't have subscribers
			if (!(event in handlers)) {
				return self;
			}

			// Get handlers
			handlers = handlers[event];

			// Return fast if there's no HEAD
			if (!(HEAD in handlers)) {
				return self;
			}

			// Get first handler
			handler = handlers[HEAD];

			// Step through handlers
			keep: do {
				// Check if context matches
				if (handler[CONTEXT] === context) {
					// Continue if no callback was provided
					if (length === 2) {
						continue;
					}

					// Reset offset, then loop callbacks
					for (offset = 2; offset < length; offset++) {
						// Continue if handler CALLBACK matches
						if (handler[CALLBACK] === args[offset]) {
							continue keep;
						}
					}
				}

				// It there's no head - link head -> tail -> handler
				if (!head) {
					head = tail = handler;
				}
				// Otherwise just link tail -> tail[NEXT] -> handler
				else {
					tail = tail[NEXT] = handler;
				}
			} while ((handler = handler[NEXT]));

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

			return self;
		},

		/**
		 * Reemit event from memory
		 * @param {String} event to reemit
		 * @param {Object} context to scope callback to
		 * @param {Boolean} senile flag to indicate if already trigger callbacks should still be called
		 * @param {...Function} callback to reemit
		 * @returns {Object} instance of this
		 */
		"reemit" : function reemit(event, context, senile, callback) {
			var self = this;
			var args = arguments;
			var handlers = self[HANDLERS];
			var handler;
			var handled;
			var marked;
			var length = args[LENGTH];
			var offset;
			var found;

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

					// Get first handler
					handler = handlers[HEAD];

					// Compute marked handled (and store current handled)
					marked = (handled = handlers[HANDLED]) + 1;

					// Step through handlers
					do {
						// Start unmarked block
						unmarked : {
							// If context does not match we have to mark
							if (handler[CONTEXT] !== context) {
								break unmarked;
							}

							// Reset found and offset, iterate args
							for (found = false, offset = 3; offset < length; offset++) {
								// If callback matches set found and break
								if (handler[CALLBACK] === args[offset]) {
									found = true;
									break;
								}
							}

							// If we can't find callback, or are unhandled and not senile, we have to mark
							if (!found || handler[HANDLED] === handled && !senile) {
								break unmarked;
							}

							// Don't mark
							continue;
						}

						// Mark this handler as handled (to prevent emit)
						handler[HANDLED] = marked;
					} while ((handler = handler[NEXT]));

					// Return self.emit with memory
					return self.emit.apply(self, handlers[MEMORY]);
				}
			}

			// Return resolved promise
			return when.resolve();
		},

		/**
		 * Execute each of the listeners in order with the supplied arguments
		 * @param {String} event to emit
		 * @returns {Promise} promise that resolves with results from all listeners
		 */
		"emit" : function emit(event) {
			var self = this;
			var args = arguments;
			var handlers = self[HANDLERS];
			var handler;
			var handled;
			var unhandled;
			var unhandledCount;
			var matches;
			var method;
			var next;

			// See if we should override method
			if ((matches = RE.exec(event)) !== null) {
				event = matches[1];
				method = matches[2];
			}

			// Define next
			next = method === "sequence"
				/**
				 * Internal function for sequential execution of unhandled handlers
				 * @private
				 * @param {Array} [_arg] result from previous handler callback
				 * @return {Promise} promise of next handler callback execution
				 */
				? (function (result, resultCount) {
					return function (_args) {
						// Store result
						if (resultCount++ >= 0) {
							result[resultCount] = _args;
						}

						// Return a chained promise of next callback, or a promise resolved with args
						return (handler = unhandled[unhandledCount++])
							? when(handler[CALLBACK].apply(handler[CONTEXT], args), next)
							: when.resolve(result);
					}
				})([], -1)
				/**
				 * Internal function for piped execution of unhandled handlers
				 * @private
				 * @param {Array} [_arg] result from previous handler callback
				 * @return {Promise} promise of next handler callback execution
				 */
				: function (_args) {
					// Update args
					args = _args || args;

					// Return a chained promise of next callback, or a promise resolved with args
					return (handler = unhandled[unhandledCount++])
						? when(handler[CALLBACK].apply(handler[CONTEXT], args), next)
						: when.resolve(handlers[MEMORY] = args);
				};

			// Have event in handlers
			if (event in handlers) {
				// Get handlers
				handlers = handlers[event];

				// Have head in handlers
				if (HEAD in handlers) {
					// Create unhandled array and count
					unhandled = [];
					unhandledCount = 0;

					// Get first handler
					handler = handlers[HEAD];

					// Update handled
					handled = ++handlers[HANDLED];

					// Step handlers
					do {
						// If we're already handled, continue
						if (handler[HANDLED] === handled) {
							continue;
						}

						// Update handled
						handler[HANDLED] = handled;

						// Push handler on unhandled
						unhandled[unhandledCount++] = handler;
					}
					// While there is a next handler
					while ((handler = handler[NEXT]));

					// Reset unhandledCount
					unhandledCount = 0;

					// Return promise (of unhandled execution)
					return next(args);
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
		}
	});
});