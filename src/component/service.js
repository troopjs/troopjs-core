/*!
 * TroopJS service component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "./gizmo" ], function ServiceModule(Gizmo) {
	function onState(topic, state) {
		this.state(state);
	}

	return Gizmo.extend({
		initialize : function initialize() {
			var self = this;

			return self.subscribe("state", self, true, onState);
		},

		finalize : function finalize() {
			return self.unsubscribe("state", onState);
		}
	});
});