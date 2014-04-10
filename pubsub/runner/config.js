/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"module",
	"troopjs-util/merge"
], function LoomConfigModule(module, merge) {
	"use strict";

	/**
	 * Provides configuration for the pubsub package
	 * @class core.pubsub.runner.config
	 * @protected
	 * @static
	 * @alias feature.config
	 */
	return merge.call({
		/**
		 * @cfg {RegExp} pattern RegExp used to determine if a {@link core.component.base#phase phase} should be protected
		 * @private
		 */
		"pattern" : /^(?:initi|fin)alized?$/
	}, module.config());
});