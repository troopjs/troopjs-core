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
	var STATE = "state";
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
		var iCallbacks = [];
		var fCallbacks = [];
		var sCount = 0;
		var iCount = 0;
		var fCount = 0;
		var i;

		// Iterate prototype chain (while there's a prototype)
		do {
			// Check if we have INITIALIZE on __proto__
			add: if (__proto__.hasOwnProperty(INITIALIZE)) {
				// Store callback
				callback = __proto__[INITIALIZE];

				// Reset counter
				i = iCount;

				// Loop iCallbacks, break add if we've already added this callback
				while (i--) {
					if (callback === iCallbacks[i]) {
						break add;
					}
				}

				// Store callback
				iCallbacks[iCount++] = callback;
			}

			// Check if we have FINALIZE on __proto__
			add: if (__proto__.hasOwnProperty(FINALIZE)) {
				// Store callback
				callback = __proto__[FINALIZE];

				// Reset counter
				i = fCount;

				// Loop fCallbacks, break add if we've already added this callback
				while (i--) {
					if (callback === fCallbacks[i]) {
						break add;
					}
				}

				// Store callback
				fCallbacks[fCount++] = callback;
			}

			// Check if we have STATE on __proto__
			add: if (__proto__.hasOwnProperty(STATE)) {
				// Store callback
				callback = __proto__[STATE];

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
			initialize : iCount <= 1
				// No prototypes, use original
				? self[INITIALIZE]
				: function initialize() {
					var _self = this;
					var count = -1;
					var length = iCount;

					// Loop iCallbacks start to end and execute
					while (++count < length) {
						iCallbacks[count].apply(_self, arguments);
					}

					return _self;
				},

			finalize : fCount <= 1
				// No prototypes, use original
				? self[FINALIZE]
				: function finalize() {
					var _self = this;
					var count = -1;
					var length = fCount;

					// Loop fCallbacks start to end and execute
					while (++count < length) {
						fCallbacks[count].apply(_self, arguments);
					}

					return _self;
				},

			state : sCount <= 1
				// No prototypes, use original
				? self[STATE]
				: function state(state, deferred) {
					var _self = this;
					var count = sCount;
					var callbacks = [];

					// Build deferred chain from end to 1
					while (--count) {
						callbacks[count] = Deferred(function (dfd) {
							var callback = sCallbacks[count];
							var _deferred = sCallbacks[count + 1] || deferred;
	
							dfd.done(function done() {
								callback.call(_self, state, _deferred);
							});
						});
					}

					// Execute first sCallback, use first deferred or default
					sCallbacks[0].call(_self, state, callbacks[1] || deferred);

					return _self;
				}
		});
	}, {
		displayName : "core/component/gadget",

		initialize : function initialize() {
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
					hub.subscribe(topic, self, matches[1] === MEMORY, value);

					// Store in subscriptions
					subscriptions[subscriptions.length] = [topic, self, value];

					// NULL value
					self[key] = NULL;
				}
			}

			return self;
		},

		finalize : function finalize() {
			var self = this;

			var subscriptions = self[SUBSCRIPTIONS];
			var subscription;

			// Loop over subscriptions
			while (subscription = subscriptions.shift()) {
				hub.unsubscribe(subscription[0], subscription[1], subscription[2]);
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
		},

		/**
		 * Defaul state handler
		 * @param state state
		 * @param deferred deferred
		 * @returns self
		 */
		state : function state(state, deferred) {
			if (deferred) {
				deferred.resolve();
			}
		}
	});
});
