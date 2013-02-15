/**
 * TroopJS core/component/service
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define([ "./gadget" ], function ServiceModule(Gadget) {
	var CONFIGURATION = "configuration";

	return Gadget.extend({
		"displayName" : "core/component/service",

		"sig/initialize" : function onStart() {
			var self = this;

			return self.publish("registry/add", self);
		},

		"sig/finalize" : function onFinalize() {
			var self = this;

			return self.publish("registry/remove", self);
		},

		"configure" : function configure(configuration) {
			var self = this;

			self[CONFIGURATION] = configuration || {};

			return self;
		}
	});
});