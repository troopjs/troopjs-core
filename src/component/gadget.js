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

		do {
			add: if (__proto__.hasOwnProperty(INITIALIZE)) {
				callback = __proto__[INITIALIZE];

				i = iCount;

				while (i--) {
					if (callback === iCallbacks[i]) {
						break add;
					}
				}

				iCallbacks[iCount++] = callback;
			}

			add: if (__proto__.hasOwnProperty(FINALIZE)) {
				callback = __proto__[FINALIZE];

				i = fCount;

				while (i--) {
					if (callback === fCallbacks[i]) {
						break add;
					}
				}

				fCallbacks[fCount++] = callback;
			}

			add: if (__proto__.hasOwnProperty(STATE)) {
				callback = __proto__[STATE];

				i = sCount;

				while (i--) {
					if (callback === sCallbacks[i]) {
						break add;
					}
				}

				sCallbacks[sCount++] = callback;
			}
		} while (__proto__ = __proto__.__proto__);

		Compose.call(self, {
			initialize : iCount <= 1
				? self[INITIALIZE]
				: function initialize() {
					var _self = this;
					var count = -1;
					var length = iCount;

					while (++count < length) {
						iCallbacks[count].apply(_self, arguments);
					}

					return _self;
				},

			finalize : fCount <= 1
				? self[FINALIZE]
				: function finalize() {
					var _self = this;
					var count = -1;
					var length = fCount;

					while (++count < length) {
						fCallbacks[count].apply(_self, arguments);
					}

					return _self;
				},

			state : sCount <= 1
				? self[STATE]
				: function state(state, deferred) {
					var _self = this;
					var count = sCount;
					var callbacks = [];

					while (--count) {
						callbacks[count] = Deferred(function (dfd) {
							var callback = sCallbacks[count];
							var _deferred = sCallbacks[count + 1] || deferred;
	
							dfd.done(function done() {
								callback.call(_self, state, _deferred);
							});
						});
					}

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

		state : function state(state, deferred) {
			if (deferred) {
				deferred.resolve();
			}
		}
	});
});
