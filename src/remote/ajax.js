/*!
 * TroopJS remote/ajax module
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "compose", "../component/gadget", "../pubsub/topic", "jquery", "../util/merge" ], function AjaxModule(Compose, Gadget, Topic, $, merge) {

	function request(topic, settings, deferred) {
		// Request
		$.ajax(merge.call({
			"headers": {
				"x-request-id": new Date().getTime(),
				"x-components": topic.constructor === Topic ? topic.trace() : topic
			}
		}, settings)).then(deferred.resolve, deferred.reject);
	}

	return Compose.create(Gadget, function Ajax() {
		var self = this;

		self.subscribe("hub/ajax", self, request);
	}, {
		displayName : "remote/ajax"
	});
});