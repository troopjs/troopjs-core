/**
 * TroopJS core/event/config
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([ "module", "troopjs-utils/merge" ], function EventConfigModule(module, merge) {
	"use strict";

	/**
	 * This module is to provide configurations **loom** from it's AMD module config.
	 *
	 * To change the configuration, refer to RequireJS [module config API][1]:
	 *
	 * 	requirejs.config(
	 * 	{
	 * 		config: { "troopjs-core/event/config" : { "re_runner" : /^someRegexp/, ...  } }
	 * 	})
	 *
	 * [1]: http://requirejs.org/docs/api.html#config-moduleconfig
	 *
	 * @class core.event.config
	 * @singleton
	 */
	return merge.call({
		/**
		 * @cfg {String} context Property of the handler where the **context** resides.
		 */
		"context" : "context",

		/**
		 * @cfg {String} callback Property of the handler where the **callback** resides.
		 */
		"callback" : "callback",

		/**
		 * @cfg {String} data Property of the handler where the **data** resides.
		 */
		"data" : "data",

		/**
		 * @cfg {String} head Property of the handlers where the **head** resides.
		 */
		"head" : "head",

		/**
		 * @cfg {String} tail Property of the handlers where the **tail** resides.
		 */
		"tail" : "tail",

		/**
		 * @cfg {String} next Property of the handlers where the **next** resides.
		 */
		"next" : "next",

		/**
		 * @cfg {String} handled Property of the handlers where the **handled** resides.
		 */
		"handled" : "handled",

		/**
		 * @cfg {String} handlers Property of the component where the **handlers** resides.
		 */
		"handlers": "handlers",

		/**
		 * @cfg {String} runners Property of the component where the **runners** resides.
		 */
		"runners" : "runners",

		/**
		 * @cfg {String} default Property of the runners where the **refault** runner resides.
		 */
		"default" : "default",

		/**
		 * @cfg {RegExp} re_runner Regular expression used to parse alternative runners.
		 */
		"re_runner" :/^(.+)(?::(\w+))/
	}, module.config());
});