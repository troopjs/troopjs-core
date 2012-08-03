/*!
 * TroopJS gadget component
 * @license TroopJS Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/*jshint strict:false, smarttabs:true, newcap:false, forin:false, loopfunc:true */
/*global define:true */
define([ "compose", "./base", "troopjs-utils/deferred", "../pubsub/hub" ], function GadgetModule(Compose, Component, Deferred, hub) {
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
		var key = null;

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
			signal : function onSignal(signal, deferred) {
				var _self = this;
				var _callbacks;
				var _j;
				var head = deferred;

				// Only trigger if we have callbacks for this signal
				if (signal in signals) {
					// Get callbacks
					_callbacks = signals[signal];

					// Reset counter
					_j = _callbacks.length;

					// Build deferred chain from end to 1
					while (--_j) {
						// Create new deferred
						head = Deferred(function (dfd) {
							// Store callback and deferred as they will have changed by the time we exec
							var _callback = _callbacks[_j];
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
				else if (deferred) {
					deferred.resolve();
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
			while ((subscription = subscriptions.shift()) !== UNDEFINED) {
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

			deferred = deferred || Deferred();

			Deferred(function deferredStart(dfdStart) {
				dfdStart.then(deferred.resolve, deferred.reject, deferred.notify);

				Deferred(function deferredInitialize(dfdInitialize) {
					dfdInitialize.then(function doneInitialize() {
						self.signal("start", dfdStart);
					}, dfdStart.reject, dfdStart.notify);

					self.signal("initialize", dfdInitialize);
				});
			});

			return self;
		},

		stop : function stop(deferred) {
			var self = this;

			deferred = deferred || Deferred();

			Deferred(function deferredFinalize(dfdFinalize) {
				dfdFinalize.then(deferred.resolve, deferred.reject, deferred.notify);

				Deferred(function deferredStop(dfdStop) {
					dfdStop.then(function doneStop() {
						self.signal("finalize", dfdFinalize);
					}, dfdFinalize.reject, dfdFinalize.notify);

					self.signal("stop", dfdStop);
				});
			});

			return self;
		}
	});
});
