/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([ "./gadget" ], function ServiceModule(Gadget) {
	"use strict";

	/**
	 * Base class for all service alike components.
	 *
	 * @class core.component.service
	 * @extends core.component.gadget
	 */

	/**
	 * @method constructor
	 * @inheritdoc
	 */
	return Gadget.extend({
		"displayName" : "core/component/service"
	});
});