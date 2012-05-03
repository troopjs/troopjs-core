/*!
 * TroopJS service component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "./gadget" ], function ServiceModule(Gadget) {
	var STATE = "state";

	function onState(topic, state) {
		this.state(state);
	}

	return Gadget.extend({
		displayName : "component/service",

		initialize : function initialize() {
			var self = this;

			return self.subscribe(STATE, self, true, onState);
		},

		finalize : function finalize() {
			var self = this;

			return self.unsubscribe(STATE, self, onState);
		}
	});
});