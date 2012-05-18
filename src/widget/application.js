/*!
 * TroopJS widget/application component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "../component/widget", "../util/deferred" ], function ApplicationModule(Widget, Deferred) {
	return Widget.extend({
		displayName : "core/widget/application",

		"sig/start" : function start(signal, deferred) {
			var self = this;

			self.weave(deferred);

			return self;
		},

		"sig/stop" : function stop(signal, deferred) {
			var self = this;

			self.unweave(deferred);

			return self;
		}
	});
});