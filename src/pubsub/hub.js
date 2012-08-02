/*!
 * TroopJS pubsub/hub module
 * @license TroopJS Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/*jshint strict:false, smarttabs:true, laxbreak:true */
/*global define:true */
define([ "compose", "../component/base", "./topic" ], function HubModule(Compose, Component, Topic) {
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
	var ROOT = {};
	var HANDLERS = {};
	var COUNT = 0;

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
			var arg = arguments;
			var length = arg[LENGTH];
			var context = arg[1];
			var memory = arg[2];
			var callback = arg[3];
			var offset;
			var handlers;
			var handler;
			var handled;
			var head;
			var tail;

			// No context or memory was supplied
			if (context instanceof FUNCTION) {
				callback = context;
				memory = false;
				context = ROOT;
				offset = 1;
			}
			// Only memory was supplied
			else if (context === true || context === false) {
				callback = memory;
				memory = context;
				context = ROOT;
				offset = 2;
			}
			// Context was supplied, but not memory
			else if (memory instanceof FUNCTION) {
				callback = memory;
				memory = false;
				offset = 2;
			}
			// All arguments were supplied
			else if (callback instanceof FUNCTION){
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

				// Want memory and have memory
				if (memory && MEMORY in handlers) {
					// Get memory
					memory = handlers[MEMORY];

					// Get handled
					handled = memory[HANDLED];

					// Optimize for arguments
					if (memory[LENGTH] > 0 ) {
						// Loop through handlers
						while(handler) {
							// Skip to next handler if this handler has already been handled
							if (handler[HANDLED] === handled) {
								handler = handler[NEXT];
								continue;
							}

							// Store handled
							handler[HANDLED] = handled;

							// Apply handler callback
							handler[CALLBACK].apply(handler[CONTEXT], memory);

							// Update handler
							handler = handler[NEXT];
						}
					}
					// Optimize for no arguments
					else {
						// Loop through handlers
						while(handler) {
							// Skip to next handler if this handler has already been handled
							if (handler[HANDLED] === handled) {
								handler = handler[NEXT];
								continue;
							}

							// Store handled
							handler[HANDLED] = handled;

							// Call handler callback
							handler[CALLBACK].call(handler[CONTEXT]);

							// Update handler
							handler = handler[NEXT];
						}
					}
				}
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
			var self = this;
			var arg = arguments;
			var length = arg[LENGTH];
			var context = arg[1];
			var callback = arg[2];
			var offset;
			var handlers;
			var handler;
			var head;
			var previous = null;

			// No context or memory was supplied
			if (context instanceof FUNCTION) {
				callback = context;
				context = ROOT;
				offset = 1;
			}
			// All arguments were supplied
			else if (callback instanceof FUNCTION){
				offset = 2;
			}
			// Something is wrong, return fast
			else {
				return self;
			}

			// Fast fail if we don't have subscribers
			if (!(topic in HANDLERS)) {
				return self;
			}

			// Get handlers
			handlers = HANDLERS[topic];

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
							// Re-link head and previous, then
							// continue
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
		 * Publishes on a topic
		 * 
		 * @param topic Topic to publish to
		 * @param arg (optional) Argument
		 * @returns self
		 */
		publish : function publish(topic /*, arg, arg, ..*/) {
			var arg = arguments;
			var handlers;
			var handler;

			// Store handled
			var handled = arg[HANDLED] = COUNT++;

			// Have handlers
			if (topic in HANDLERS) {
				// Get handlers
				handlers = HANDLERS[topic];

				// Remember arguments
				handlers[MEMORY] = arg;

				// Get first handler
				handler = handlers[HEAD];

				// Optimize for arguments
				if (arg[LENGTH] > 0) {
					// Loop through handlers
					while(handler) {
						// Skip to next handler if this handler has already been handled
						if (handler[HANDLED] === handled) {
							handler = handler[NEXT];
							continue;
						}

						// Update handled
						handler[HANDLED] = handled;

						// Apply handler callback
						handler[CALLBACK].apply(handler[CONTEXT], arg);

						// Update handler
						handler = handler[NEXT];
					}
				}
				// Optimize for no arguments
				else {
					// Loop through handlers
					while(handler) {
						// Skip to next handler if this handler has already been handled
						if (handler[HANDLED] === handled) {
							handler = handler[NEXT];
							continue;
						}

						// Update handled
						handler[HANDLED] = handled;

						// Call handler callback
						handler[CALLBACK].call(handler[CONTEXT]);

						// Update handler
						handler = handler[NEXT];
					}
				}
			}
			// No handlers
			else if (arg[LENGTH] > 0){
				// Create handlers and store with topic
				HANDLERS[topic] = handlers = {};

				// Remember arguments
				handlers[MEMORY] = arg;
			}

			return this;
		}
	});
});
