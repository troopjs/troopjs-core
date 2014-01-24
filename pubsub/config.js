/**
 * TroopJS core/pubsub/config
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([ "module", "troopjs-utils/merge" ], function PubSubConfigModule(module, merge) {
	"use strict";

	/**
	 * @class core.pubsub.config
	 * @singleton
	 */
	return merge.call({

		/**
		 * @cfg {String} runner Name of default runner.
		 */
		"runner": "pipeline",

		/**
		 * @cfg {Object} runners Custom runners.
		 */
		"runners" : {}
	}, module.config());
});