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
	var RE_HUB = /^hub(?::(\w+))?\/(.+)/;
	var RE_SIG = /^sig\/(.+)/;
	var PUBLISH = hub.publish;
	var SUBSCRIBE = hub.subscribe;
	var UNSUBSCRIBE = hub.unsubscribe;
	var MEMORY = "memory";
	var SUBSCRIPTIONS = "subscriptions";
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
		var callbacks;
		var callback;
		var i;
		var iMax;

		var signals = {};
		var signal;
		var matches;
		var key = null;

		// Iterate prototype chain (while there's a prototype)
		do {
			add: for (key in __proto__) {
				// Get value
				callback = __proto__[key];

				// Continue if value is not a function
				if (!(callback instanceof FUNCTION)) {
					continue;
				}

				// Match signature in key
				matches = RE_SIG.exec(key);

				if (matches !== NULL) {
					// Get signal
					signal = matches[1];

					// Have we stored any callbacks for this signal?
					if (signal in signals) {
						// Get callbacks (for this signal)
						callbacks = signals[signal];

						// Reset counters
						i = iMax = callbacks.length;

						// Loop callbacks, continue add if we've already added this callback
						while (i--) {
							if (callback === callbacks[i]) {
								continue add;
							}
						}

						// Add callback to callbacks chain
						callbacks[iMax] = callback;
					}
					else {
						// First callback
						signals[signal] = [ callback ];
					}
				}
			}
		} while (__proto__ = getPrototypeOf(__proto__));

		// Extend self
		Compose.call(self, {
			signal : function signal(signal, deferred) {
				var _self = this;
				var _callbacks;
				var _i;
				var head = deferred;

				// Only trigger if we have callbacks for this signal
				if (signal in signals) {
					// Get callbacks
					_callbacks = signals[signal];

					// Reset counter
					_i = _callbacks.length;

					// Build deferred chain from end to 1
					while (--_i) {
						// Create new deferred
						head = Deferred(function (dfd) {
							// Store callback and deferred as they will have changed by the time we exec
							var _callback = _callbacks[_i];
							var _deferred = head;

							// Add done handler
							dfd.done(function done() {
								_callback.call(_self, signal, _deferred);
							});
						});
					}

					// Execute first sCallback, use head deferred
					_callbacks[0].call(_self, signal, head);
				}

				return _self;
			}
		});
	}, {
		displayName : "core/component/gadget",

		"sig/initialize" : function initialize(signal, deferred) {
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
				matches = RE_HUB.exec(key);

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

			if (deferred) {
				deferred.resolve();
			}

			return self;
		},

		"sig/finalize" : function finalize(signal, deferred) {
			var self = this;
			var subscriptions = self[SUBSCRIPTIONS];
			var subscription;

			// Loop over subscriptions
			while (subscription = subscriptions.shift()) {
				hub.unsubscribe(subscription[0], subscription[1], subscription[2]);
			}

			if (deferred) {
				deferred.resolve();
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
