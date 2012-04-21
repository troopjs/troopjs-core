/*!
 * TroopJS gadget component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/**
 * The gadget trait provides convenient access to common application logic
 */
define([ "compose", "./base", "../pubsub/hub", "../pubsub/topic"  ], function GadgetModule(Compose, Component, hub, Topic) {
	var NULL = null;
	var FUNCTION = Function;
	var RE = /^hub(?::(\w+))?\/(.+)/;
	var PUBLISH = hub.publish;
	var SUBSCRIBE = hub.subscribe;
	var UNSUBSCRIBE = hub.unsubscribe;
	var MEMORY = "memory";
	var SUBSCRIPTIONS = "subscriptions";

	function protoExecProxy(property) {
		function protoExec() {
			var self = this;
			var proto;
			var callback;
			var current;
			var head = NULL;
			var tail = NULL;

			// Get prototype of instance
			proto = self.__proto__;

			// Iterate proto stack
			while(proto) {
				// Make sure property exists on proto
				if (proto.hasOwnProperty(property)) {
					// Get callback
					callback = proto[property];

					// Add to list block
					add : {
						current = head;

						// Iterate callback stack to make sure we don't have this callback in there
						while(current) {
							if (current === callback) {
								break add;
							}
							current = current.next;
						}

						// If we already have a tail, update tail.next, otherwise update head - then set tail to callback
						tail = tail
							? tail.next = callback
							: head = callback;
					}
				}

				// Update proto
				proto = proto.__proto__;
			}

			// Start from head
			current = head;

			// Iterate callback stack
			while (current) {
				// Apply callback
				current.apply(self, arguments);

				// Update current
				current = current.next;
			}

			return self;
		}

		return protoExec;
	}

	return Component.extend(function Gadget() {
		var self = this;

		Compose.call(self, {
			finalize : protoExecProxy("finalize"),
			destroy : protoExecProxy("destroy"),
		});
	}, {
		finalize : function finalize() {
			var self = this;
			var subscriptions = self[SUBSCRIPTIONS] = [];
			var key = NULL;
			var value;
			var matches;
			var topic;

			// Loop over each property in gadget
			for (key in self) {
				// Get value
				value = self[key];

				// Continue if value is not a function
				if (!(value instanceof FUNCTION)) {
					continue;
				}

				// Match signature in key
				matches = RE.exec(key);

				if (matches !== NULL) {
					// Get topic
					topic = matches[2];

					// Subscribe
					hub.subscribe(Topic(topic, self), self, matches[1] === MEMORY, value);

					// Store in subscriptions
					subscriptions[subscriptions.length] = [topic, value];

					// NULL value
					self[key] = NULL;
				}
			}

			return self;
		},

		/**
		 * Destructor for hub subscriptions
		 * @returns self
		 */
		destroy : function destroy() {
			var subscriptions = self[SUBSCRIPTIONS];
			var subscription;

			// Loop over subscriptions
			while (subscription = subscriptions.shift()) {
				hub.unsubscribe(subscription[0], subscription[1]);
			}

			return self;
		},

		/**
		 * Calls hub.publish in self context
		 * @returns self
		 */
		publish : function publish() {
			var self = this;

			PUBLISH.apply(hub, arguments);

			return self;
		},

		/**
		 * Calls hub.subscribe in self context
		 * @returns self
		 */
		subscribe : function subscribe() {
			var self = this;

			SUBSCRIBE.apply(hub, arguments);

			return self;
		},

		/**
		 * Calls hub.unsubscribe in self context
		 * @returns self
		 */
		unsubscribe : function unsubscribe() {
			var self = this;

			UNSUBSCRIBE.apply(hub, arguments);

			return self;
		}
	});
});
