/*!
 * TroopJS base component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "compose", "config", "pubsub/hub", "pubsub/topic", "deferred" ], function BaseComponentModule(Compose, config, hub, Topic, Deferred) {
	var PUBLISH = hub.publish;
	var SUBSCRIBE = hub.subscribe;
	var UNSUBSCRIBE = hub.unsubscribe;
	var COUNT = 0;

	return Compose(function BaseComponent() {
		this.instanceCount = COUNT++;
	}, {
		config : config,
		displayName : "component/base",

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

		request : function request(setting, deferred) {
			var self = this;

			self.publish(new Topic("app/request", self), setting, deferred);

			return self;
		},

		toString : function toString() {
			var self = this;

			return self.displayName + "@" + self.instanceCount;
		}
	});
});
