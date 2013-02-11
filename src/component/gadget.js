/**
 * TroopJS core/component/gadget
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define([ "../event/emitter", "when", "../pubsub/hub" ], function GadgetModule(Emitter, when, hub) {
	/*jshint laxbreak:true */

	var ARRAY_PUSH = Array.prototype.push;
	var PUBLISH = hub.publish;
	var REPUBLISH = hub.republish;
	var SUBSCRIBE = hub.subscribe;
	var UNSUBSCRIBE = hub.unsubscribe;
	var LENGTH = "length";
	var FEATURES = "features";
	var TYPE = "type";
	var VALUE = "value";
	var SUBSCRIPTIONS = "subscriptions";

	return Emitter.extend(function Gadget() {
		this[SUBSCRIPTIONS] = [];
	}, {
		"displayName" : "core/component/gadget",

		/**
		 * Signal handler for 'initialize'
		 */
		"sig/initialize" : function initialize() {
			var self = this;
			var subscription;
			var subscriptions = self[SUBSCRIPTIONS];
			var special;
			var specials = self.constructor.specials.hub;
			var i;
			var iMax;
			var type;
			var value;

			// Iterate specials
			for (i = 0, iMax = specials ? specials[LENGTH] : 0; i < iMax; i++) {
				// Get special
				special = specials[i];

				// Create subscription
				subscription = subscriptions[i] = {};

				// Set subscription properties
				subscription[TYPE] = type = special[TYPE];
				subscription[FEATURES] = special[FEATURES];
				subscription[VALUE] = value = special[VALUE];

				// Subscribe
				SUBSCRIBE.call(hub, type, self, value);
			}
		},

		/**
		 * Signal handler for 'start'
		 */
		"sig/start" : function start() {
			var self = this;
			var subscription;
			var subscriptions = self[SUBSCRIPTIONS];
			var results = [];
			var resultsLength = 0;
			var i;
			var iMax;
			var deferred = when.defer();

			// Iterate subscriptions
			for (i = 0, iMax = subscriptions[LENGTH]; i < iMax; i++) {
				// Get subscription
				subscription = subscriptions[i];

				// If this is not a "memory" subscription - continue
				if (subscription[FEATURES] !== "memory") {
					continue;
				}

				// Republish, store result
				results[resultsLength++] = REPUBLISH.call(hub, subscription[TYPE], self, subscription[VALUE]);
			}

			// Return promise that will resolve when all results are resolved
			return when.all(results);
		},

		/**
		 * Signal handler for 'finalize'
		 */
		"sig/finalize" : function finalize() {
			var self = this;
			var subscription;
			var subscriptions = self[SUBSCRIPTIONS];
			var i;
			var iMax;

			// Iterate subscriptions
			for (i = 0, iMax = subscriptions[LENGTH]; i < iMax; i++) {
				// Get subscription
				subscription = subscriptions[i];

				// Unsubscribe
				UNSUBSCRIBE.call(hub, subscription[TYPE], self, subscription[VALUE]);
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
			var args = [ self ];

			// Add self as context
			ARRAY_PUSH.call(args, arguments);

			// Subscribe
			SUBSCRIBE.apply(hub, args);

			return self;
		},

		/**
		 * Calls hub.unsubscribe in self context
		 */
		"unsubscribe" : function unsubscribe() {
			var self = this;
			var args = [ self ];

			// Add self as context
			ARRAY_PUSH.call(args, arguments);

			// Unsubscribe
			UNSUBSCRIBE.apply(hub, args);

			return self;
		}
	});
});
