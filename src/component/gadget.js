/**
 * TroopJS core/component/gadget
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
			var properties = self[PROPERTIES][HUB];
			var subscriptions;
			var args;
			var key;
			var i;
			var j;
			var iMax;

			// Iterate properties
			for (key in properties) {
				// Get subscriptions
				subscriptions = properties[key];

				// Create args
				args = [key, self];

				// Extract VALUE into args
				for (i = 0, iMax = subscriptions[LENGTH], j = args[LENGTH]; i < iMax; i++) {
					args[j++] = subscriptions[i][VALUE];
				}

				// Did we capture any args?
				if (j > 2) {
					SUBSCRIBE.apply(hub, args);
				}
			}
		},

		/**
		 * Signal handler for 'start'
		 */
		"sig/start" : function start() {
			var self = this;
			var properties = self[PROPERTIES][HUB];
			var results = [];
			var subscriptions;
			var subscription;
			var args;
			var key;
			var i;
			var j;
			var iMax;

			for (key in properties) {
				// Get subscriptions
				subscriptions = properties[key];

				// Create args
				args = [key, self];

				// Extract callbacks into args
				for (i = 0, iMax = subscriptions[LENGTH], j = args[LENGTH]; i < iMax; i++) {
					subscription = subscriptions[i];

					// Only add onto args if we have "memory"
					if (subscription[FEATURES] === "memory") {
						args[j++] = subscription[VALUE];
					}
				}

				// Did we capture any args?
				if (j > 2) {
					results[results[LENGTH]] = REPUBLISH.apply(hub, args);
				}
			}

			// Return promise that will resolve when all republish is done
			return when.all(results);
		},

		/**
		 * Signal handler for 'finalize'
		 */
		"sig/finalize" : function finalize() {
			var self = this;
			var properties = self[PROPERTIES][HUB];
			var subscriptions;
			var args;
			var key;
			var i;
			var j;
			var iMax;

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
