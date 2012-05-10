/*!
 * TroopJS widget/application component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "../component/widget", "deferred" ], function ApplicationModule(Widget, Deferred) {
	return Widget.extend({
		displayName : "core/widget/application",

		signal : function signal(signal, deferred) {
			var self = this;

			switch (signal) {
			case "start":
				self.weave(deferred);
				break;

			case "stop":
				self.unweave();

			default:
				if (deferred) {
					deferred.resolve();
				}
			}

			return self;
		}
	});
});