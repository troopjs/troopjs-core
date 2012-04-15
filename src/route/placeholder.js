define([ "../component/placeholder" ], function RoutePlaceholderModule(Placeholder) {
	return Placeholder.extend(function RoutePlaceholderWidget($element, name) {
		var self = this;
		var re = new RegExp($element.data("route"));

		self.publish("route:add", function onRoute(uri) {
			if (re.test(uri.path)) {
				self.release();
			}
			else {
				self.hold();
			}
		});
	});
});