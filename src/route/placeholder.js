/*!
 * TroopJS route/placeholder module
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "compose", "../widget/placeholder" ], function RoutePlaceholderModule(Compose, Placeholder) {
	return Placeholder.extend(function RoutePlaceholderWidget($element, name) {
		var self = this;
		var re = RegExp($element.data("route"));

		Compose.call(self, {
			"hub:memory/route" : function onRoute(topic, uri) {
				console.info(arguments);
				if (re.test(uri.path)) {
					self.release();
				}
				else {
					self.hold();
				}
			}
		});
	});
});