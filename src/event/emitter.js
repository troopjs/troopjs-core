/*!
 * TroopJS event/emitter module
 * @license TroopJS Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/*global define:false */
define([ "compose", "when" ], function EventEmitterModule(Compose, when) {
	/*jshint strict:false, smarttabs:true, laxbreak:true */

	var UNDEFINED;
	var FUNCTION = Function;
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
		 * @param {Object} [context] to scope callbacks to
		 * @param {...Function} callback for this event
		 * @throws {Error} if no callbacks are provided
		 * @return {Object} instance of this
		 */
		on : function on(event, context, callback) {
			var self = this;
			var arg = arguments;
			var length = arg[LENGTH];
			var handlers = self[HANDLERS];
			var handler;
			var head;
			var tail;
			var offset;

			// If context is a function it's actually a callback and context should be UNDEFINED
			if (context instanceof FUNCTION) {
				context = UNDEFINED;
				offset = 1;
			}
			// Context was not a function, but do we have callback(s)?
			else if (callback instanceof FUNCTION) {
				offset = 2;
			}
			// No callback(s) provided - throw!
			else {
				throw new Error("no callback(s) supplied");
			}

			// Have handlers
			if (event in handlers) {

				// Get handlers
				handlers = handlers[event];

				// Create new handler
				handler = {};

				// Set handler callback to next arg from offset
				handler[CALLBACK] = arg[offset++];

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
					handler[CALLBACK] = arg[offset++];

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
				handler[CALLBACK] = arg[offset++];

				// Set handler context
				handler[CONTEXT] = context;

				// Iterate handlers from offset
				while (offset < length) {
					// Set tail -> tail[NEXT] -> handler
					tail = tail[NEXT] = handler = {};

					// Set handler callback to next arg from offset
					handler[CALLBACK] = arg[offset++];

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
		 * @param {String} event to unsubscribe from
		 * @param {Object} [context]to scope callbacks to
		 * @param {...Function} [callback] to unsubscribe, if none are provided all callbacks are unsubscribed
		 * @return {Object} instance of this
		 */
		off : function off(event, context, callback) {
			var self = this;
			var arg = arguments;
			var length = arg[LENGTH];
			var handlers = self[HANDLERS];
			var handler;
			var head;
			var previous;
			var offset;

			// If context is a function it's actually a callback and context should be UNDEFINED
			if (context instanceof FUNCTION) {
				context = UNDEFINED;
				offset = 1;
			}
			// context was not a callback
			else {
				offset = 2;
			}

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

			// Get head
			head = handlers[HEAD];

			// Loop callbacks
			while (offset < length) {
				// Store callback
				callback = arg[offset++];

				// Get first handler
				handler = previous = head;

				// Step through handlers
				do {
					// Check if this handler should be unlinked
					if (handler[CALLBACK] === callback && (context === UNDEFINED || handler[CONTEXT] === context)) {
						// Is this the first handler
						if (handler === head) {
							// Re-link head and previous, then continue
							head = previous = handler[NEXT];
							continue;
						}

						// Unlink current handler, then continue
						previous[NEXT] = handler[NEXT];
						continue;
					}

					// Update previous pointer
					previous = handler;
				} while ((handler = handler[NEXT]) !== UNDEFINED);
			}

			// Update head and tail
			if (head && previous) {
				handlers[HEAD] = head;
				handlers[TAIL] = previous;
			}
			else {
				delete handlers[HEAD];
				delete handlers[TAIL];
			}

			return self;
		},

		/**
		 * Reemit event from memory
		 * @param {String} event to reemit
		 * @param {Object} [context] to filter callbacks by
		 * @param {...Function} [callback] to reemit, if none are provided all callbacks will be reemited
		 * @return {Object} instance of this
		 */
		reemit : function reemit(event, context, callback) {
			var self = this;
			var arg = arguments;
			var length = arg[LENGTH];
			var handlers = self[HANDLERS];
			var handler;
			var handled;
			var head;
			var offset;

			// If context is a function it's actually a callback and context should be UNDEFINED
			if (context instanceof FUNCTION) {
				context = UNDEFINED;
				offset = 1;
			}
			// context was not a callback
			else {
				offset = 2;
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

					// Get first handler
					head = handlers[HEAD];

					// Compute next handled
					handled = handlers[HANDLED] + 1;

					// Loop callbacks
					while (offset < length) {
						// Store callback
						callback = arg[offset++];

						// Get first handler
						handler = head;

						// Step through handlers
						do {
							// Check if this handler should be reemited
							if (handler[CALLBACK] === callback && (context === UNDEFINED || handler[CONTEXT] === context)) {
								continue;
							}

							// Mark this handler as already handled (to prevent reemit)
							handler[HANDLED] = handled;
						} while ((handler = handler[NEXT]) !== UNDEFINED);
					}

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
		 * @return {Promise} promise that resolves with results from all listeners
		 */
		emit : function emit(event) {
			var self = this;
			var arg = arguments;
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
				arg = _arg || arg;

				// Step forward until we find a unhandled handler
				while(handler[HANDLED] === handled) {
					// No more handlers, escape!
					if (!(handler = handler[NEXT])) {
						// Remember arg
						handlers[MEMORY] = arg;

						// Return promise resolved with arg
						return when.resolve(arg);
					}
				}

				// Update handled
				handler[HANDLED] = handled;

				// Return promise of callback execution, chain next
				return when(handler[CALLBACK].apply(handler[CONTEXT], arg), next);
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
						return next(arg);
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
			handlers[MEMORY] = arg;

			// Return promise resolved with arg
			return when.resolve(arg);
		}
	});
});