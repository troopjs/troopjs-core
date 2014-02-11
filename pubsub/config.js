/**
 * TroopJS core/pubsub/config
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([ "module", "../event/constants", "troopjs-utils/merge" ], function PubSubConfigModule(module, EVENT_CONST, merge) {
	"use strict";

	/**
	 * @class core.pubsub.config
	 * @singleton
	 */
	var config = {};

	/**
	 * @cfg {Object} runners Custom runners.
	 */
	config[EVENT_CONST["runners"]] = {};

	// Return merged config
	return merge.call(config, module.config());
});