/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"module",
	"mu-merge"
], function (module, merge) {
	"use strict";

	/**
	 * Provides configuration for the pubsub components
	 * @class core.pubsub.config
	 * @private
	 * @alias feature.config
	 */

	return merge.call({
		/**
		 * @cfg {RegExp} skip Pattern of phases to skip.
		 */
		"skip" : /^(?:initi|fin)alized?$/
	}, module.config());
});