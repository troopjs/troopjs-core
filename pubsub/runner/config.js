/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"module",
	"troopjs-utils/merge"
], function LoomConfigModule(module, merge) {
	"use strict";

	/**
	 * This module provide configuration for the **pubsub runners** from it's AMD module config.
	 *
	 * To change the configuration, refer to RequireJS [module config API](http://requirejs.org/docs/api.html#config-moduleconfig):
	 *
	 * 	requirejs.config(
	 * 	{
	 * 		config: { "troopjs-core/pubsub/runner/config" : { "pattern" : /regexp/ } }
	 * 	})
	 *
	 * @class core.pubsub.runner.config
	 * @protected
	 * @singleton
	 */
	return merge.call({
		/**
		 * @cfg {RegExp} pattern RegExp used to determine if a {@link core.component.base#phase phase} should be protected
		 */
		"pattern" : /^(?:initi|fin)alized?$/
	}, module.config());
});