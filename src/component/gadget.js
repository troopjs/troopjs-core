/**
 * TroopJS gadget component
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define([ "./base", "when", "../pubsub/hub" ], function GadgetModule(Component, when, hub) {
	/*jshint laxbreak:true */

	var UNDEFINED;
	var NULL = null;
	var FUNCTION = Function;
	var ARRAY_PROTO = Array.prototype;
	var ARRAY_SLICE = ARRAY_PROTO.slice;
	var ARRAY_SPLICE = ARRAY_PROTO.splice;
	var ARRAY_UNSHIFT = ARRAY_PROTO.unshift;
	var RE_HUB = /^hub(?::(\w+))?\/(.+)/;
	var RE_SIG = /^sig(?::(\w+))?\/(.+)/;
	var PUBLISH = hub.publish;
	var REPUBLISH = hub.republish;
	var SUBSCRIBE = hub.subscribe;
	var UNSUBSCRIBE = hub.unsubscribe;
	var LENGTH = "length";
	var FEATURES = "features";
	var SIGNALS = "signals";
	var SUBSCRIPTIONS = "subscriptions";

	return Component.extend(function Gadget() {
		var self = this;
		var bases = self.constructor._getBases(true);
		var base;
		var callbacks;
		var callback;
		var i = bases[LENGTH];
		var j;
		var jMax;

		var signals = self[SIGNALS] = {};
		var signal;
		var matches;
		var key;

		// Iterate base chain (backwards)
		while((base = bases[--i])) {

			add: for (key in base) {
				// Get value
				callback = base[key];

				// Continue if value is not a function
				if (!(callback instanceof FUNCTION)) {
					continue;
				}

				// Continue if we can't match
				if ((matches = RE_SIG.exec(key)) === NULL) {
					continue;
				}

				// Get signal
				signal = matches[2];

				// Have we stored any callbacks for this signal?
				if (signal in signals) {
					// Get callbacks (for this signal)
					callbacks = signals[signal];

					// Reset counters
					j = jMax = callbacks[LENGTH];

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
					signals[signal] = [callback];
				}
			}
		}
	}, {
		"displayName" : "core/component/gadget",

		/**
		 * Signal handler for 'initialize'
		 */
		"sig/initialize" : function initialize() {
			var self = this;
			var subscription;
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

				// Continue if we can't match
				if ((matches = RE_HUB.exec(key)) === NULL) {
					continue;
				}

				// Get topic
				topic = matches[2];

				// Subscribe
				SUBSCRIBE.call(hub, topic, self, value);

				// Create and store subscription
				subscriptions[subscriptions[LENGTH]] = subscription = [topic, self, value];

				// Store features
				subscription[FEATURES] = matches[1];

				// NULL value
				self[key] = NULL;
			}
		},

		"sig/start" : function start() {
			var self = this;
			var subscriptions = self[SUBSCRIPTIONS];
			var subscription;
			var i = subscriptions[LENGTH];
			var results = [];

			while ((subscription = subscriptions[--i]) !== UNDEFINED) {
				if (subscription[FEATURES] !== "memory") {
					continue;
				}

				results.push(REPUBLISH.call(hub, subscription[0], subscription[1], subscription[2]));
			}

			return when.map(results, function (o) { return o; });
		},

		/**
		 * Signal handler for 'finalize'
		 */
		"sig/finalize" : function finalize() {
			var self = this;
			var subscriptions = self[SUBSCRIPTIONS];
			var subscription;

			// Loop over subscriptions
			while ((subscription = subscriptions.shift()) !== UNDEFINED) {
				UNSUBSCRIBE.call(hub, subscription[0], subscription[1], subscription[2]);
			}
		},

		/**
		 * Signals the component
		 * @param signal {String} Signal
		 * @return {*}
		 */
		"signal" : function onSignal(signal) {
			var self = this;
			var args = ARRAY_SLICE.call(arguments);
			var callbacks = self[SIGNALS][signal];
			var length = callbacks
				? callbacks[LENGTH]
				: 0;
			var index = 0;

			function next(_args) {
				// Update args
				args = _args || args;

				// Return a chained promise of next callback, or a promise resolved with args
				return length > index
					? when(callbacks[index++].apply(self, args), next)
					: when.resolve(args);
			}

			try {
				// Return promise
				return next();
			}
			catch (e) {
				// Return rejected promise
				return when.reject(e);
			}
		},

		/**
		 * Calls hub.publish in self context
		 */
		"publish" : function publish() {
			return PUBLISH.apply(hub, arguments);
		},

		/**
		 * Calls hub.subscribe in self context
		 */
		"subscribe" : function subscribe() {
			var self = this;
			var args = arguments;

			// Add self as context
			ARRAY_SPLICE.call(args, 1, 0, self);

			// Subscribe
			SUBSCRIBE.apply(hub, args);

			return self;
		},

		/**
		 * Calls hub.unsubscribe in self context
		 */
		"unsubscribe" : function unsubscribe() {
			var self = this;
			var args = arguments;

			// Add self as context
			ARRAY_SPLICE.call(args, 1, 0, self);

			// Unsubscribe
			UNSUBSCRIBE.apply(hub, args);

			return self;
		},

		/**
		 * Start the component
		 * @return {*}
		 */
		"start" : function start() {
			var self = this;
			var _signal = self.signal;
			var args = arguments;

			// Add signal to arguments
			ARRAY_UNSHIFT.call(args, "initialize");

			return _signal.apply(self, args).then(function () {
				// Modify args to change signal
				args[0] = "start";

				return _signal.apply(self, args);
			});
		},

		/**
		 * Stops the component
		 * @return {*}
		 */
		"stop" : function stop() {
			var self = this;
			var _signal = self.signal;
			var args = arguments;

			// Add signal to arguments
			ARRAY_UNSHIFT.call(args, "stop");

			return _signal.apply(self, args).then(function () {
				// Modify args to change signal
				args[0] = "finalize";

				return _signal.apply(self, args);
			});
		}
	});
});
