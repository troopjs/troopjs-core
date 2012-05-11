/*!
 * TroopJS widget/application component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "../component/widget", "deferred" ], function ApplicationModule(Widget, Deferred) {
	return Widget.extend({
		displayName : "core/widget/application",

		"sig/initialize" : function initialize(signal, deferred) {
			var self = this;

			self.weave(deferred);

			return self;
		},

		"sig/finalize" : function finalize(signal, deferred) {
			var self = this;

			self.unweave(deferred);

			return self;
		}
	});
});