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
	var COUNT = 0;

	return Compose(function EventEmitter() {
		this[HANDLERS] = {};
	}, {
		/**
		 * Subscribe to a event
		 *
		 * @param event Event to subscribe to
		 * @param context (optional) context to scope callbacks to
		 * @param callback Callback for this event
		 * @returns self
		 */
		on : function on(event /*, context, callback, callback, ..*/) {
			var self = this;
			var arg = arguments;
			var length = arg[LENGTH];
			var context = arg[1];
			var callback = arg[2];
			var handlers = self[HANDLERS];
			var handler;
			var head;
			var tail;
			var offset;

			// If context is a function it's actually a callback and context should be ROOT
			if (context instanceof FUNCTION) {
				context = UNDEFINED;
				offset = 1;
			}
			// Context was not a function, is callback (sanity check)
			else if (callback instanceof FUNCTION){
				offset = 2;
			}
			// Something is wrong
			else {
				throw new Error("no callbacks supplied");
			}

			// Have handlers
			if (event in handlers) {

				// Get handlers
				handlers = handlers[event];

				// Create new handler
				handler = {
					"callback" : arg[offset++],
					"context" : context
				};

				// Get tail handler
				tail = TAIL in handlers
					// Have tail, update handlers.tail.next to point to handler
					? handlers[TAIL][NEXT] = handler
					// Have no tail, update handlers.head to point to handler
					: handlers[HEAD] = handler;

				// Iterate handlers from offset
				while (offset < length) {
					// Set tail -> tail.next -> handler
					tail = tail[NEXT] = {
						"callback" : arg[offset++],
						"context" : context
					};
				}

				// Set tail handler
				handlers[TAIL] = tail;
			}
			// No handlers
			else {
				// Create head and tail
				head = tail = {
					"callback" : arg[offset++],
					"context" : context
				};

				// Iterate handlers from offset
				while (offset < length) {
					// Set tail -> tail.next -> handler
					tail = tail[NEXT] = {
						"callback" : arg[offset++],
						"context" : context
					};
				}

				// Create event list
				handlers[event] = {
					"head" : head,
					"tail" : tail
				};
			}

			return self;
		},

		/**
		 * Unsubscribes from event
		 *
		 * @param event Event to unsubscribe from
		 * @param context (optional) context to scope callbacks to
		 * @param callback (optional) Callback to unsubscribe, if none
		 *        are provided all callbacks are unsubscribed
		 * @returns self
		 */
		off : function off(event /*, context, callback, callback, ..*/) {
			var self = this;
			var arg = arguments;
			var length = arg[LENGTH];
			var context = arg[1];
			var callback = arg[2];
			var handlers = self[HANDLERS];
			var handler;
			var head;
			var previous;
			var offset;

			// If context is a function it's actually a callback and context should be ROOT
			if (context instanceof FUNCTION) {
				context = UNDEFINED;
				offset = 1;
			}
			// Context was not a function, is callback (sanity check)
			else if (callback instanceof FUNCTION){
				offset = 2;
			}
			// Something is wrong
			else {
				throw new Error("no callbacks supplied");
			}

			// Return fast if we don't have subscribers
			if (!(event in handlers)) {
				return self;
			}

			// Get handlers
			handlers = handlers[event];

			// Get head
			head = handlers[HEAD];

			// Loop over remaining arguments
			while (offset < length) {
				// Store callback
				callback = arg[offset++];

				// Get first handler
				handler = previous = head;

				// Loop through handlers
				do {
					// Check if this handler should be unlinked
					if (handler[CALLBACK] === callback && handler[CONTEXT] === context) {
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
		 * Emit an event
		 *
		 * @param event Event to emit
		 * @param arg (optional) Arguments
		 * @returns self
		 */
		emit : function emit(event /*, arg, arg, ..*/) {
			var self = this;
			var arg = arguments;
			var handlers = self[HANDLERS];
			var handler;
			var handled;

			/**
			 * Internal function for async execution handlers
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
				handled = handlers[HANDLED] = COUNT++;

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
			}

			// Remember arg
			handlers[MEMORY] = arg;

			// Return promise resolved with arg
			return when.resolve(arg);
		}
	});
});