/**
 * TroopJS core/event/const
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define({
	/**
	 * @const {String} context Property of the handler where the **context** resides.
	 */
	"context" : "context",

	/**
	 * @const {String} callback Property of the handler where the **callback** resides.
	 */
	"callback" : "callback",

	/**
	 * @const {String} data Property of the handler where the **data** resides.
	 */
	"data" : "data",

	/**
	 * @const {String} head Property of the handlers where the **head** resides.
	 */
	"head" : "head",

	/**
	 * @const {String} tail Property of the handlers where the **tail** resides.
	 */
	"tail" : "tail",

	/**
	 * @const {String} next Property of the handlers where the **next** resides.
	 */
	"next" : "next",

	/**
	 * @const {String} modified Property of the handlers where the **modified** resides.
	 */
	"modified" : "modified",

	/**
	 * @const {String} handlers Property of the component where the **handlers** resides.
	 */
	"handlers": "handlers",

	/**
	 * @const {String} runner Property of the component indicating the name of the default runner
	 */
	"runner" : "runner",

	/**
	 * @const {String} runners Property of the component where the **runners** resides.
	 */
	"runners" : "runners",

	/**
	 * @const {RegExp} pattern Regular expression used to parse alternative runners.
	 */
	"pattern" : /^(.+)(?::(\w+))/
});