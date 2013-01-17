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
	var RE_PRO = /^(\w+)(?::(\w+))?\/(.+)/;
	var PUBLISH = hub.publish;
	var REPUBLISH = hub.republish;
	var SUBSCRIBE = hub.subscribe;
	var UNSUBSCRIBE = hub.unsubscribe;
	var LENGTH = "length";
	var FEATURES = "features";
	var CONTEXT = "context";
	var VALUE = "value";
	var SUBSCRIPTIONS = "subscriptions";
	var PROPERTIES = "properties";

	return Component.extend(function Gadget() {
		var self = this;
		var bases = self.constructor._getBases(true);
		var base;
		var i = bases[LENGTH];

		var properties = self[PROPERTIES] = {};
		var property;
		var matches;
		var key;
		var type;
		var name;

		// Iterate base chain (backwards)
		while((base = bases[--i])) {
			// Iterate keys
			for (key in base) {
				// Continue if this is not a property on base
				if (!base.hasOwnProperty(key)) {
					continue;
				}

				// Continue if we can't match
				if ((matches = RE_PRO.exec(key)) === NULL) {
					continue;
				}

				// Get type
				type = matches[1];

				// Get or create type from properties
				type = type in properties
					? properties[type]
					: properties[type] = {};

				// Get name
				name = matches[3];

				// Get or create name from type
				name = name in type
					? type[name]
					: type[name] = [];

				// Create and set property by type/name
				property = name[name[LENGTH]] = {};

				// Init property
				property[FEATURES] = matches[2];
				property[CONTEXT] = base;
				property[VALUE] = base[key];
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
			var i = subscriptions[LENGTH];

			// Loop over subscriptions
			while ((subscription = subscriptions[--i]) !== UNDEFINED) {
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
			var signals = self[PROPERTIES]["sig"][signal];
			var length = signals
				? signals[LENGTH]
				: 0;
			var index = 0;

			function next(_args) {
				// Update args
				args = _args || args;

				// Return a chained promise of next callback, or a promise resolved with args
				return length > index
					? when(signals[index++][VALUE].apply(self, args), next)
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
