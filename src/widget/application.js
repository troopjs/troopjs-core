/*!
 * TroopJS widget/application component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "compose", "../component/widget" ], function ApplicationModule(Compose, Widget) {
	return Widget.extend(function ApplicationWidget($element, name) {
		var self = this;

		Compose.call(self, {
			"build/application" : function build() {
				self
					.weave($element)
					.publish("start", name);
			},

			"destroy/application" : function destroy() {
				var self = this;

				self
					.publish("stop", name)
					.unweave($element);
			}
		});
	});
});