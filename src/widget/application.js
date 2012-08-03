/*!
 * TroopJS widget/application component
 * @license TroopJS Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "../component/widget", "troopjs-utils/deferred" ], function ApplicationModule(Widget, Deferred) {
	return Widget.extend({
		displayName : "core/widget/application",

		"sig/start" : function start(signal, deferred) {
			this.weave(deferred);
		},

		"sig/stop" : function stop(signal, deferred) {
			this.unweave(deferred);
		}
	});
});