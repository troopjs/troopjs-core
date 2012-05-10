/*!
 * TroopJS remote/ajax module
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "../component/service", "../pubsub/topic", "jquery", "../util/merge" ], function AjaxModule(Service, Topic, $, merge) {
	return Service.extend({
		displayName : "core/remote/ajax",

		"hub/ajax" : function request(topic, settings, deferred) {
			// Request
			$.ajax(merge.call({
				"headers": {
					"x-request-id": new Date().getTime(),
					"x-components": topic instanceof Topic ? topic.trace() : topic
				}
			}, settings)).then(deferred.resolve, deferred.reject);
		}
	});
});