/*!
 * TroopJS gadget component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/**
 * The gadget trait provides life cycle management
 */
define([ "compose", "./base", "deferred", "../pubsub/hub" ], function GadgetModule(Compose, Component, Deferred, hub) {
	var NULL = null;
	var OBJECT = Object;
	var FUNCTION = Function;
	var RE = /^hub(?::(\w+))?\/(.+)/;
	var PUBLISH = hub.publish;
	var SUBSCRIBE = hub.subscribe;
	var UNSUBSCRIBE = hub.unsubscribe;
	var MEMORY = "memory";
	var SUBSCRIPTIONS = "subscriptions";
	var SIGNAL = "signal";
	var START = "start";
	var STOP = "stop";
	var INITIALIZE = "initialize";
	var FINALIZE = "finalize";
	var __PROTO__ = "__proto__";

	var getPrototypeOf = OBJECT.getPrototypeOf || (__PROTO__ in OBJECT
		? function getPrototypeOf(object) {
			return object[__PROTO__];
		}
		: function getPrototypeOf(object) {
			return object.constructor.prototype;
		});

	return Component.extend(function Gadget() {
		var self = this;
		var __proto__ = self;
		var callback;
		var sCallbacks = [];
		var sCount = 0;
		var i;

		// Iterate prototype chain (while there's a prototype)
		do {
			// Check if we have SIGNAL on __proto__
			add: if (__proto__.hasOwnProperty(SIGNAL)) {
				// Store callback
				callback = __proto__[SIGNAL];

				// Reset counter
				i = sCount;

				// Loop sCallbacks, break add if we've already added this callback
				while (i--) {
					if (callback === sCallbacks[i]) {
						break add;
					}
				}

				// Store callback
				sCallbacks[sCount++] = callback;
			}
		} while (__proto__ = getPrototypeOf(__proto__));

		// Extend self
		Compose.call(self, {
			signal : sCount <= 1
				// No prototypes, use original
				? self[SIGNAL]
				: function signal(signal, deferred) {
					var _self = this;
					var head = deferred;
					var count = sCount;

					// Build deferred chain from end to 1
					while (--count) {
						head = Deferred(function (dfd) {
							var callback = sCallbacks[count];
							var _deferred = head;
	
							dfd.done(function done() {
								callback.call(_self, signal, _deferred);
							});
						});
					}

					// Execute first sCallback, use head deferred
					sCallbacks[0].call(_self, signal, head);

					return _self;
				}
		});
	}, {
		displayName : "core/component/gadget",

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
		},

		/**
		 * Defaul signal handler
		 * @param signal Signal
		 * @param deferred Deferred
		 * @returns self
		 */
		signal : function signal(signal, deferred) {
			var self = this;

			var subscriptions;
			var subscription;
			var key = NULL;
			var value;
			var matches;
			var topic;

			switch (signal) {
			case INITIALIZE:
				// Reset subscriptions
				subscriptions  = self[SUBSCRIPTIONS] = [];

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
						hub.subscribe(topic, self, matches[1] === MEMORY, value);

						// Store in subscriptions
						subscriptions[subscriptions.length] = [topic, self, value];

						// NULL value
						self[key] = NULL;
					}
				}
				break;

			case FINALIZE:
				subscriptions = self[SUBSCRIPTIONS];

				// Loop over subscriptions
				while (subscription = subscriptions.shift()) {
					hub.unsubscribe(subscription[0], subscription[1], subscription[2]);
				}
				break;
			}

			if (deferred) {
				deferred.resolve();
			}

			return self;
		},

		start : function start(deferred) {
			var self = this;

			Deferred(function deferredStart(dfdStart) {
				Deferred(function deferredInitialize(dfdInitialize) {
					self.signal(INITIALIZE, dfdInitialize);
				})
				.done(function doneInitialize() {
					self.signal(START, dfdStart);
				})
				.fail(dfdStart.reject);

				if (deferred) {
					dfdStart.then(deferred.resolve, deferred.reject);
				}
			});

			return self;
		},

		stop : function stop(deferred) {
			var self = this;

			Deferred(function deferredFinalize(dfdFinalize) {
				Deferred(function deferredStop(dfdStop) {
					self.signal(STOP, dfdStop);
				})
				.done(function doneStop() {
					self.signal(FINALIZE, dfdFinalize);
				})
				.fail(dfdFinalize.reject);

				if (deferred) {
					dfdFinalize.then(deferred.resolve, deferred.reject);
				}
			});

			return self;
		}
	});
});
