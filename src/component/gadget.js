/*!
 * TroopJS gadget component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/**
 * The gadget trait provides convenient access to common application
 * logic such as pubsub* and ajax
 */
define([ "compose", "./base", "../pubsub/hub", "../pubsub/topic", "deferred" ], function GadgetModule(Compose, Component, hub, Topic, Deferred) {
	var NULL = null;
	var BUILD = "build";
	var DESTROY = "destroy";
	var RE_SCAN = new RegExp("^(" + [BUILD, DESTROY].join("|") + ")/.+");
	var RE_HUB = /^hub\/(.+)/;
	var PUBLISH = hub.publish;
	var SUBSCRIBE = hub.subscribe;
	var UNSUBSCRIBE = hub.unsubscribe;

	return Component.extend(function Gadget() {
		var self = this;
		var builder = NULL;
		var destructor = NULL;
		var subscriptions = new Array();

		Compose.call(self, {
			/**
			 * Iterates builders and executes them in reverse order
			 * @returns self
			 */
			build : function build() {
				var key = NULL;
				var value;
				var matches;
				var current;

				// Loop over each property in component
				for (key in self) {
					// Get matches
					matches = RE_SCAN.exec(key);

					// Make sure we have matches
					match: if (matches !== NULL) {
						// Get value
						value = self[key];

						switch (matches[1]) {
						case BUILD:
							// Update next
							value.next = builder;
							// Update current
							builder = value;
							break;

						case DESTROY:
							// Update next
							value.next = destructor;
							// Update current
							destructor = value;
							break;

						default:
							break match;
						}

						// Update topic
						value.topic = key;

						// Remove value from self
						delete self[key];
					}
				}

				// Set current
				current = builder;

				while (current !== NULL) {
					current.call(self);

					current = current.next;
				}

				return self;
			},

			/**
			 * Iterates destructors and executes them in reverse order
			 * @returns self
			 */
			destroy : function iterator() {
				var current = destructor;

				while (current !== NULL) {
					current.call(self);

					current = current.next;
				}

				return self;
			},

			/**
			 * Builder for hub subscriptions
			 * @returns self
			 */
			"build/hub" : function build() {
				var key = NULL;
				var value;
				var matches;
				var topic;

				// Loop over each property in gadget
				for (key in self) {
					// Match signature in key
					matches = RE_HUB.exec(key);

					if (matches !== NULL) {
						// Get topic
						topic = matches[1];

						// Get value
						value = self[key];

						// Subscribe
						hub.subscribe(new Topic(topic, self), self, value);

						// Store in subscriptions
						subscriptions[subscriptions.length] = [topic, value];

						// Remove value from self
						delete self[key];
					}
				}

				return self;
			},

			/**
			 * Destructor for hub subscriptions
			 * @returns self
			 */
			"destroy/hub": function destroy() {
				var subscription;

				// Loop over subscriptions
				while (subscription = subscriptions.shift()) {
					hub.unsubscribe(subscription[0], subscription[1]);
				}

				return self;
			},
		});
	}, {
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
