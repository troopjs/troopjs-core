/*!
 * TroopJS gadget component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "./base", "pubsub/hub", "pubsub/topic", "deferred" ], function GadgetComponentModule(Component, hub, Topic, Deferred) {
	var PUBLISH = hub.publish;
	var SUBSCRIBE = hub.subscribe;
	var UNSUBSCRIBE = hub.unsubscribe;

	return Component.extend({
		displayName : "component/gadget",

		publish : function publish() {
			var self = this;

			PUBLISH.apply(hub, arguments);

			return self;
		},

		subscribe : function subscribe() {
			var self = this;

			SUBSCRIBE.apply(hub, arguments);

			return self;
		},

		unsubscribe : function unsubscribe() {
			var self = this;

			UNSUBSCRIBE.apply(hub, arguments);

			return self;
		},

		ajax : function ajax(setting, deferred) {
			var self = this;

			self.publish(new Topic("app/ajax", self), setting, deferred);

			return self;
		},
	});
});
