/**
 * TroopJS core/pubsub/config
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([ "module", "../event/constants", "troopjs-utils/merge" ], function PubSubConfigModule(module, CONSTANTS, merge) {
	"use strict";

	/**
	 * @class core.pubsub.config
	 * @singleton
	 */
	var config = {};

		/**
		 * @cfg {String} runner Name of default runner.
		 */
	config[CONSTANTS["runner"]] = "pipeline";

		/**
		 * @cfg {Object} runners Custom runners.
		 */
	config[CONSTANTS["runners"]] = {};

	// Return merged config
	return merge.call(config, module.config());
});