/*!
 * TroopJS pubsub/hub module
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "compose", "../component/base", "./topic" ], function HubModule(Compose, Component, Topic) {
	var UNDEFINED = undefined;
	var RECURSIVE = "\/" + "**";
	var RE = /\/\w+(?=\/)|\*{1,2}$/g;
	var CONTEXT = {};
	var HANDLERS = {};

	return Compose.create({
		displayName: "pubsub/hub",

		/**
		 * Subscribe to a topic
		 * 
		 * @param topic Topic to subscribe to
		 * @param context (optional) context to scope callbacks to
		 * @param callback Callback for this topic
		 * @returns self
		 */
		subscribe : function subscribe(topic, context, callback /*, callback, ..*/) {
			var offset = 1;
			var length = arguments.length;
			var handlers;
			var head;
			var tail;

			// No provided context, set default one
			if (context instanceof Function) {
				context = CONTEXT;
			}
			// Context was provided, increase offset
			else {
				offset++;
			}

			// Do we have handlers
			if (topic in HANDLERS) {
				// Get handlers
				handlers = HANDLERS[topic];

				// Get last handler
				tail = handlers.tail;

				for (; offset < length; offset++) {
					// Set last -> last.next -> handler
					tail = tail.next = {
						"callback" : arguments[offset],
						"context" : context
					};
				}

				// Set last handler
				handlers.tail = tail;
			}
			// No handlers
			else {
				// Create head and tail
				head = tail = {
					"callback" : arguments[offset++],
					"context" : context
				};

				// Loop through arguments
				for (; offset < length; offset++) {
					// Set last -> last.next -> handler
					tail = tail.next = {
						"callback" : arguments[offset],
						"context" : context
					};
				}

				// Create topic list
				HANDLERS[topic] = {
					"head" : head,
					"tail" : tail
				};
			}

			return this;
		},

		/**
		 * Unsubscribes from topic
		 * 
		 * @param topic Topic to unsubscribe from
		 * @param callback (optional) Callback to unsubscribe, if none
		 *        are provided all callbacks are unsubscribed
		 * @returns self
		 */
		unsubscribe : function unsubscribe(topic /*, callback, callback, ..*/) {
			var offset;
			var length = arguments.length;
			var head;
			var previous = null;
			var handler;
			var callback;

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
				for (offset = 1; offset < length; offset++) {
					// Store callback
					callback = arguments[offset];

					// Get first handler
					handler = previous = head;

					// Loop through handlers
					do {
						// Check if this handler should be unlinked
						if (handler.callback === callback) {
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
			var string = topic instanceof Topic
					? topic.toString()
					: topic;
			var candidates = Array();
			var candidate;
			var length = 0;
			var handler;

			// Create initial set of candidates
			while (RE.test(string)) {
				candidates[length++] = string.substr(0, RE.lastIndex) + RECURSIVE;
			}

			// Are sub-topics even possible?
			if (length > 0) {
				// Copy second to last candidate to last, minus the last
				// char
				candidates[length] = candidates[length - 1].slice(0, -1);

				// Increase length
				length++;
			}

			// Add original topic to the candidates
			candidates[length] = string;

			// Loop backwards over candidates, optimize for no arguments
			if (arguments.length === 0) do {
				// Get candidate
				candidate = candidates[length];

				// Fail fast if there are no handlers for candidate
				if (!(candidate in HANDLERS)) {
					continue;
				}

				// Get first handler
				handler = HANDLERS[candidate].head;

				// Loop through and call handlers
				do {
					handler.callback.call(handler.context);
				} while (handler = handler.next);
			} while (length-- > 0)
			// Loop backwards over candidates, optimize for arguments
			else do {
				// Get candidate
				candidate = candidates[length];

				// Fail fast if there are no handlers for candidate
				if (!(candidate in HANDLERS)) {
					continue;
				}

				// Get first handler
				handler = HANDLERS[candidate].head;

				// Loop through and apply handlers
				do {
					handler.callback.apply(handler.context, arguments);
				} while (handler = handler.next);
			} while (length-- > 0);

			return this;
		}
	});
});
