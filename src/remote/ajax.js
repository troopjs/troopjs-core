/*!
 * TroopJS remote/ajax module
 * @license TroopJS Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/*global define:false */
define([ "../component/service", "../pubsub/topic", "jquery", "troopjs-utils/merge" ], function AjaxModule(Service, Topic, $, merge) {
	/*jshint strict:false */

	return Service.extend({
		displayName : "core/remote/ajax",

		"hub/ajax" : function ajax(topic, settings) {
			// Request
			return $.ajax(merge.call({
				"headers": {
					"x-request-id": new Date().getTime(),
					"x-components": topic instanceof Topic ? topic.trace() : topic
				}
			}, settings));
		}
	});
});