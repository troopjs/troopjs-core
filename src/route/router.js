/*!
 * TroopJS route/router module
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "compose", "../component/widget", "../util/uri", "callbacks" ], function RouteRouterModule(Compose, Widget, URI, Callbacks) {
	var NULL = null;

	return Widget.extend(function RouteRouterWidget($element, name) {
		var self = this;
		var callbacks = Callbacks("memory unique");
		var oldUri = NULL;
		var newUri = NULL;

		Compose.call(self, {
			"hub/route" : function fireRouteCallbacks(topic, uri) {
				newUri = uri.toString();

				if (newUri !== oldUri) {
					oldUri = newUri;

					callbacks.fire(uri);
				}
			},

			"hub/route/add" : function addRouteCallback(topic, callback) {
				callbacks.add(callback);
			},

			"hub/route/remove" : function removeRouteCallback(topic, callback) {
				callbacks.remove(callback);
			}
		});
	}, {
		"hub/start" : function start(topic) {
			this.trigger("hashchange");
		},

		"dom/hashchange" : function onHashChange(topic, $event) {
			this.publish("route", URI($event.target.location.hash.replace(/^#/, "")));
		}
	});
});