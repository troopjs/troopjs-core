/*!
 * TroopJS gadget component
 * @license TroopJS Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/*global define:false */
define([ "compose", "./base", "when", "../pubsub/hub" ], function GadgetModule(Compose, Component, when, hub) {
	/*jshint strict:false, smarttabs:true, newcap:false, forin:false, loopfunc:true */

	var UNDEFINED;
	var NULL = null;
	var FUNCTION = Function;
	var RE_HUB = /^hub(?::(\w+))?\/(.+)/;
	var RE_SIG = /^sig\/(.+)/;
	var PUBLISH = hub.publish;
	var SUBSCRIBE = hub.subscribe;
	var UNSUBSCRIBE = hub.unsubscribe;
	var MEMORY = "memory";
	var SUBSCRIPTIONS = "subscriptions";

	return Component.extend(function Gadget() {
		var self = this;
		var bases = self.constructor._getBases(true);
		var base;
		var callbacks;
		var callback;
		var i;
		var j;
		var jMax;

		var signals = {};
		var signal;
		var matches;
		var key;

		// Iterate base chain (while there's a prototype)
		for (i = bases.length - 1; i >= 0; i--) {
			base = bases[i];

			add: for (key in base) {
				// Get value
				callback = base[key];

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
						j = jMax = callbacks.length;

						// Loop callbacks, continue add if we've already added this callback
						while (j--) {
							if (callback === callbacks[j]) {
								continue add;
							}
						}

						// Add callback to callbacks chain
						callbacks[jMax] = callback;
					}
					else {
						// First callback
						signals[signal] = [ callback ];
					}
				}
			}
		}

		// Extend self
		Compose.call(self, {
			signal : function onSignal(signal) {
				var _self = this;

				// If we have callbacks for this signal, exec, otherwise just resolve
				return signal in signals
					? when.map(signals[signal], function (callback) {
						return callback.call(_self, signal);
					})
					: when.resolve();
			}
		});
	}, {
		displayName : "core/component/gadget",

		"sig/initialize" : function initialize() {
			var self = this;

			var subscriptions = self[SUBSCRIPTIONS] = [];
			var key;
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
					SUBSCRIBE.call(hub, topic, self, matches[1] === MEMORY, value);

					// Store in subscriptions
					subscriptions[subscriptions.length] = [topic, self, value];

					// NULL value
					self[key] = NULL;
				}
			}

			return self;
		},

		"sig/finalize" : function finalize() {
			var self = this;
			var subscriptions = self[SUBSCRIPTIONS];
			var subscription;

			// Loop over subscriptions
			while ((subscription = subscriptions.shift()) !== UNDEFINED) {
				UNSUBSCRIBE.call(hub, subscription[0], subscription[1], subscription[2]);
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

		start : function start() {
			var self = this;

			return when.map(["initialize", "start"], function (signal) {
				return self.signal(signal);
			});
		},

		stop : function stop() {
			var self = this;

			return when.map(["stop", "finalize"], function (signal) {
				return self.signal(signal);
			});
		}
	});
});
