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
	 * @inheritdoc
	 */
	return Gadget.extend({
		"displayName" : "core/component/service",

		/**
		 * @inheritdoc
		 * @localdoc Registers service with the {@link core.registry.service service registry}
		 * @handler
		 */
		"sig/initialize" : function onInitialize() {
			var me = this;

			return me.publish("registry/add", me);
		},

		/**
		 * @inheritdoc
		 * @localdoc Un-registers service with the {@link core.registry.service service registry}
		 * @handler
		 */
		"sig/finalize" : function onFinalize() {
			var me = this;

			return me.publish("registry/remove", me);
		}
	});
});