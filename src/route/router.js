/*!
 * TroopJS route/router module
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "../component/widget", "../util/uri", "callbacks" ], function RouteRouterModule(Widget, URI, Callbacks) {
	var CALLBACKS = "callbacks";

	return Widget.extend(function RouteRouterWidget($element, name) {
		this[CALLBACKS] = Callbacks("memory");
	}, {
		"dom/hashchange" : function onHashChange(topic, $event) {
			this.publish("route", URI($event.target.location.hash.replace(/^#/, "")));
		},

		"hub/route" : function fireRoute(topic, uri) {
			this[CALLBACKS].fire(uri);
		},

		"hub/route/add" : function addRoute(topic, callback) {
			this[CALLBACKS].add(callback);
		},

		"hub/route/remove" : function removeRoute(topic, callback) {
			this[CALLBACKS].remove(callback);
		}
	});
});