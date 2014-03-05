/*
 * @license MIT http://troopjs.mit-license.org/
 */
define([ "troopjs-composer/mixin/factory" ], function ObjectBaseModule(Factory) {
	var INSTANCE_COUNTER = 0;
	var INSTANCE_COUNT = "instanceCount";

	/**
	 * @member core.mixin.base
	 * @method extend
	 * @inheritdoc composer.mixin.factory#extend
	 * @static
	 * @inheritable
	 */

	/**
	 * @member core.mixin.base
	 * @method create
	 * @inheritdoc composer.mixin.factory#create
	 * @static
	 * @inheritable
	 */

	/**
	 * Base object with instance count.
	 * @class core.mixin.base
	 * @constructor
	 */
	return Factory(function ObjectBase() {
		// Update instance count
		this[INSTANCE_COUNT] = ++INSTANCE_COUNTER;
	}, {
		/**
		 * Instance counter
		 * @private
		 * @readonly
		 * @property {Number}
		 */
		"instanceCount" : INSTANCE_COUNTER,

		/**
		 * A friendly name for this component
		 * @readonly
		 * @property {String}
		 */
		"displayName" : "core/mixin/base",

		/**
		 * Gives string representation of this component instance.
		 * @returns {String} {@link #displayName} and {@link #instanceCount}
		 */
		"toString" : function _toString() {
			var me = this;

			return me.displayName + "@" + me[INSTANCE_COUNT];
		}
	});
});
