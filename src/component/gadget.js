/*!
 * TroopJS gadget component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/**
 * The gadget trait provides life cycle management
 */
define([ "compose", "troopjs-compose/proto", "./base" ], function GadgetModule(Compose, proto, Component) {
	return Component.extend(function Gadget() {
		var self = this;

		Compose.call(self, {
			initialize : proto(self.initialize),
			finalize : proto(self.finalize)
		});
	}, {
		initialize : function initialize() {
			var self = this;

			return self;
		},

		finalize : function finalize() {
			var self = this;

			return self;
		}
	});
});
