/*!
 * TroopJS remote/ajax module
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "compose", "../component/gadget", "../pubsub/topic", "jquery" ], function AjaxModule(Compose, Gadget, Topic, $) {

	function request(topic, settings, deferred) {
		$.extend(true, settings, {
			"headers": {
				"x-my-request": new Date().getTime(),
				"x-my-component": topic.constructor === Topic ? topic.trace() : topic
			}
		});

		// Request
		$.ajax(settings).then(deferred.resolve, deferred.reject);
	}

	return Compose.create(Gadget, function Ajax() {
		var self = this;

		self.subscribe("hub/ajax", self, request);
	}, {
		displayName : "remote/ajax"
	});
});