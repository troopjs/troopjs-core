/**
 * TroopJS gadget component
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define([ "./base", "when", "../pubsub/hub" ], function GadgetModule(Component, when, hub) {
	/*jshint laxbreak:true */

	var ARRAY_SPLICE = Array.prototype.splice;
	var PUBLISH = hub.publish;
	var REPUBLISH = hub.republish;
	var SUBSCRIBE = hub.subscribe;
	var UNSUBSCRIBE = hub.unsubscribe;
	var HUB = "hub";
	var LENGTH = "length";
	var FEATURES = "features";
	var VALUE = "value";
	var PROPERTIES = "properties";

	return Component.extend({
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

			for (key in properties) {
				// Get subscriptions
				subscriptions = properties[key];

				// Create args
				args = [key, self];

				// Extract callbacks into args
				for (i = 0, iMax = subscriptions[LENGTH], j = args[LENGTH]; i < iMax; i++) {
					args[j++] = subscriptions[i][VALUE];
				}

				// Did we capture any args?
				if (j > 2) {
					UNSUBSCRIBE.apply(hub, args);
				}
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
		}
	});
});
