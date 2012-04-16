/*!
 * TroopJS route/placeholder module
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "../component/placeholder" ], function RoutePlaceholderModule(Placeholder) {
	return Placeholder.extend(function RoutePlaceholderWidget($element, name) {
		var self = this;
		var re = RegExp($element.data("route"));

		self.publish("route/add", function onRoute(uri) {
			if (re.test(uri.path)) {
				self.release();
			}
			else {
				self.hold();
			}
		});
	});
});