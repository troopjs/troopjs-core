/*!
 * TroopJS route/placeholder module
 * @license TroopJS Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "../widget/placeholder" ], function RoutePlaceholderModule(Placeholder) {
	var NULL = null;
	var ROUTE = "route";

	return Placeholder.extend(function RoutePlaceholderWidget($element, name) {
		this[ROUTE] = RegExp($element.data("route"));
	}, {
		"displayName" : "core/route/placeholder",

		"hub:memory/route" : function onRoute(topic, uri) {
			var self = this;
			var matches = self[ROUTE].exec(uri.path);

			if (matches !== NULL) {
				self.release.apply(self, matches.slice(1));
			}
			else {
				self.hold();
			}
		}
	});
});