/**
 * TroopJS core/event/emitter
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define([ "compose", "when" ], function EventEmitterModule(Compose, when) {
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

	return Compose(
	/**
	 * Creates a new EventEmitter
	 * @constructor
	 */
	function EventEmitter() {
		this[HANDLERS] = {};
	}, {
		/**
		 * Adds a listener for the specified event.
		 * @param {String} event to subscribe to
		 * @param {Object} context to scope callbacks to
		 * @param {...Function} callback for this event
		 * @returns {Object} instance of this
		 */
		on : function on(event, context, callback) {
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
		off : function off(event, context, callback) {
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
		 * @param {...Function} callback to reemit
		 * @returns {Object} instance of this
		 */
		reemit : function reemit(event, context, callback) {
			var self = this;
			var args = arguments;
			var handlers = self[HANDLERS];
			var handler;
			var handled;
			var length = args[LENGTH];
			var offset;

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

					// Compute next handled
					handled = handlers[HANDLED] + 1;

					// Step through handlers
					mark: do {
						// Check if context matches
						if (handler[CONTEXT] === context) {
							// Continue if no callback was provided
							if (length === 2) {
								continue;
							}

							// Reset offset, then loop callbacks
							for (offset = 2; offset < length; offset++) {
								// Break if handler CALLBACK matches
								if (handler[CALLBACK] === args[offset]) {
									continue mark;
								}
							}
						}

						// Mark this handler as handled (to prevent reemit)
						handler[HANDLED] = handled;
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
		emit : function emit(event) {
			var self = this;
			var args = arguments;
			var handlers = self[HANDLERS];
			var handler;
			var handled;

			/**
			 * Internal function for async execution of callbacks
			 * @private
			 * @param {Array} [_arg] result from previous callback
			 * @return {Promise} promise of next execution
			 */
			function next(_arg) {
				// Update arg
				args = _arg || args;

				// Step forward until we find a unhandled handler
				while(handler[HANDLED] === handled) {
					// No more handlers, escape!
					if (!(handler = handler[NEXT])) {
						// Remember arg
						handlers[MEMORY] = args;

						// Return promise resolved with arg
						return when.resolve(args);
					}
				}

				// Update handled
				handler[HANDLED] = handled;

				// Return promise of callback execution, chain next
				return when(handler[CALLBACK].apply(handler[CONTEXT], args), next);
			}

			// Have event in handlers
			if (event in handlers) {
				// Get handlers
				handlers = handlers[event];

				// Update handled
				handled = ++handlers[HANDLED];

				// Have head in handlers
				if (HEAD in handlers) {
					// Get first handler
					handler = handlers[HEAD];

					try {
						// Return promise
						return next(args);
					}
					catch (e) {
						// Return promise rejected with exception
						return when.reject(e);
					}
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