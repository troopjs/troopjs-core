/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([ "./gadget" ], function ServiceModule(Gadget) {
	"use strict";

	/**
	 * Base class for all service alike components, self-registering.
	 *
	 * @class core.component.service
	 * @extends core.component.gadget
	 */

	/**
	 * @method constructor
	 */
	return Gadget.extend({
		"displayName" : "core/component/service",

		"sig/initialize" : function onInitialize() {
			var me = this;

			return me.publish("registry/add", me);
		},

		"sig/finalize" : function onFinalize() {
			var me = this;

			return me.publish("registry/remove", me);
		}
	});
});