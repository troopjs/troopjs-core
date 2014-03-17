/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"module",
	"troopjs-utils/merge"
], function LoomConfigModule(module, merge) {
	"use strict";

	/**
	 * @class core.pubsub.runner.config
	 * @extends requirejs.config
	 * @inheritdoc
	 * @localdoc This module provide configuration for the **pubsub runners** from it's AMD module config.
	 * @protected
	 * @static
	 */
	return merge.call({
		/**
		 * @cfg {RegExp} pattern RegExp used to determine if a {@link core.component.base#phase phase} should be protected
		 */
		"pattern" : /^(?:initi|fin)alized?$/
	}, module.config());
});