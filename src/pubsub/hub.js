/*!
 * TroopJS pubsub/hub module
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "compose", "../component/base", "./topic" ], function HubModule(Compose, Component, Topic) {
	var UNDEFINED = undefined;
	var CONTEXT = {};
	var HANDLERS = {};
	var MEMORY = "memory";

	return Compose.create({
		displayName: "core/pubsub/hub",

		/**
		 * Subscribe to a topic
		 * 
		 * @param topic Topic to subscribe to
		 * @param context (optional) context to scope callbacks to
		 * @param memory (optional) do we want the last value applied to callbacks
		 * @param callback Callback for this topic
		 * @returns self
		 */
		subscribe : function subscribe(topic /*, context, memory, callback, callback, ..*/) {
			var self = this;
			var length = arguments.length;
			var context = arguments[1];
			var memory = arguments[2];
			var callback = arguments[3];
			var offset;
			var handlers;
			var handler;
			var head;
			var tail;

			// No context or memory was supplied
			if (context instanceof Function) {
				callback = context;
				memory = false;
				context = CONTEXT;
				offset = 1;
			}
			// Only memory was supplied
			else if (context === true || context === false) {
				callback = memory;
				memory = context;
				context = CONTEXT;
				offset = 2;
			}
			// Context was supplied, but not memory
			else if (memory instanceof Function) {
				callback = memory;
				memory = false;
				offset = 2;
			}
			// All arguments were supplied
			else if (callback instanceof Function){
				offset = 3;
			}
			// Something is wrong, return fast
			else {
				return self;
			}

			// Have handlers
			if (topic in HANDLERS) {

				// Get handlers
				handlers = HANDLERS[topic];

				// Create new handler
				handler = {
					"callback" : arguments[offset++],
					"context" : context
				};

				// Get last handler
				tail = "tail" in handlers
					// Have tail, update handlers.tail.next to point to handler
					? handlers.tail.next = handler
					// Have no tail, update handlers.head to point to handler
					: handlers.head = handler;

				// Iterate handlers from offset
				while (offset < length) {
					// Set last -> last.next -> handler
					tail = tail.next = {
						"callback" : arguments[offset++],
						"context" : context
					};
				}

				// Set last handler
				handlers.tail = tail;

				// Want memory and have memory
				if (memory && MEMORY in handlers) {
					// Get memory
					memory = handlers[MEMORY];

					// Loop through handlers, optimize for arguments
					if (memory.length > 0 ) while(handler) {
						// Apply handler callback
						handler.callback.apply(handler.context, memory);

						// Update handler
						handler = handler.next;
					}
					// Loop through handlers, optimize for no arguments
					else while(handler) {
						// Call handler callback
						handler.callback.call(handler.context);

						// Update handler
						handler = handler.next;
					}
				}
			}
			// No handlers
			else {
				// Create head and tail
				head = tail = {
					"callback" : arguments[offset++],
					"context" : context
				};

				// Iterate handlers from offset
				while (offset < length) {
					// Set last -> last.next -> handler
					tail = tail.next = {
						"callback" : arguments[offset++],
						"context" : context
					};
				}

				// Create topic list
				HANDLERS[topic] = {
					"head" : head,
					"tail" : tail
				};
			}

			return self;
		},

		/**
		 * Unsubscribes from topic
		 * 
		 * @param topic Topic to unsubscribe from
		 * @param context (optional) context to scope callbacks to
		 * @param callback (optional) Callback to unsubscribe, if none
		 *        are provided all callbacks are unsubscribed
		 * @returns self
		 */
		unsubscribe : function unsubscribe(topic /*, context, callback, callback, ..*/) {
			var length = arguments.length;
			var context = arguments[1];
			var callback = arguments[2];
			var offset;
			var handler;
			var head;
			var previous = null;

			// No context or memory was supplied
			if (context instanceof Function) {
				callback = context;
				context = CONTEXT;
				offset = 1;
			}
			// All arguments were supplied
			else if (callback instanceof Function){
				offset = 2;
			}
			// Something is wrong, return fast
			else {
				return self;
			}

			unsubscribe: {
				// Fast fail if we don't have subscribers
				if (!topic in HANDLERS) {
					break unsubscribe;
				}

				// Simply delete list if there is no callback to match
				if (length === 1) {
					delete HANDLERS[topic];
					break unsubscribe;
				}

				// Get head
				head = HANDLERS[topic].head;

				// Loop over remaining arguments
				while (offset < length) {
					// Store callback
					callback = arguments[offset++];

					// Get first handler
					handler = previous = head;

					// Loop through handlers
					do {
						// Check if this handler should be unlinked
						if (handler.callback === callback && handler.context === context) {
							// Is this the first handler
							if (handler === head) {
								// Re-link head and previous, then
								// continue
								head = previous = handler.next;
								continue;
							}

							// Unlink current handler, then continue
							previous.next = handler.next;
							continue;
						}

						// Update previous pointer
						previous = handler;
					} while (handler = handler.next);

					// Delete list if we've deleted all handlers
					if (head === UNDEFINED) {
						delete HANDLERS[topic];
						break unsubscribe;
					}
				}

				// Update head and tail
				HANDLERS[topic] = {
					"head" : head,
					"tail" : previous
				};
			}

			return this;
		},

		/**
		 * Publishes on a topic
		 * 
		 * @param topic Topic to publish to
		 * @param arg (optional) Argument
		 * @returns self
		 */
		publish : function publish(topic /*, arg, arg, ..*/) {
			var handlers;
			var handler;

			// Have handlers
			if (topic in HANDLERS) {
				// Get handlers
				handlers = HANDLERS[topic];

				// Remember arguments
				handlers[MEMORY] = arguments;

				// Get first handler
				handler = handlers.head;

				// Loop through handlers, optimize for arguments
				if (arguments.length > 0) while(handler) {
					// Apply handler callback
					handler.callback.apply(handler.context, arguments);

					// Update handler
					handler = handler.next;
				}
				// Loop through handlers, optimize for no arguments
				else while(handler) {
					// Call handler callback
					handler.callback.call(handler.context);

					// Update handler
					handler = handler.next;
				}
			}
			// No handlers
			else if (arguments.length > 0){
				// Create handlers and store with topic
				HANDLERS[topic] = handlers = {};

				// Remember arguments
				handlers[MEMORY] = arguments;
			}

			return this;
		}
	});
});
