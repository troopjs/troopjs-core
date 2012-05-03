/*!
 * TroopJS route/placeholder module
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "compose", "../widget/placeholder" ], function RoutePlaceholderModule(Compose, Placeholder) {
	var ROUTE = "route";

	return Placeholder.extend(function RoutePlaceholderWidget($element, name) {
		this[ROUTE] = RegExp($element.data("route"));
	}, {
		"displayName" : "route/placeholder",

		"hub:memory/route" : function onRoute(topic, uri) {
			var self = this;
			var re = self[ROUTE];

			if (re.test(uri.path)) {
				self.release();
			}
			else {
				self.hold();
			}
		}
	});
});