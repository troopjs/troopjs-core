/**
 * TroopJS core/event/config
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([ "module", "./constants", "troopjs-utils/merge" ], function EventConfigModule(module, CONSTANTS, merge) {
	"use strict";

	/**
	 * @class core.event.config
	 * @singleton
	 */
	var config = {};

	/**
	 * @cfg {String} runner Name of default runner.
	 */
	config[CONSTANTS["runner"]] = "sequence";

	/**
	 * @cfg {Object} runners Custom runners.
	 */
	config[CONSTANTS["runners"]] = {};

	// Return merged config
	return merge.call(config, module.config());
});