/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([ "troopjs-compose/factory" ], function (Factory) {
	var INSTANCE_COUNTER = 0;
	var INSTANCE_COUNT = "instanceCount";

	/**
	 * Base composition with instance count.
	 * @class core.composition
	 * @implement compose.composition
	 */

	/**
	 * @method create
	 * @static
	 * @inheritable
	 * @inheritdoc
	 * @return {core.composition} Instance of this class
	 */

	/**
	 * @method extend
	 * @static
	 * @inheritable
	 * @inheritdoc
	 * @return {core.composition} The extended subclass
	 */

	/**
	 * Creates a new component instance
	 * @method constructor
	 */
	return Factory(function () {
		/**
		 * Instance counter
		 * @private
		 * @readonly
		 * @property {Number}
		 */
		this[INSTANCE_COUNT] = ++INSTANCE_COUNTER;
	}, {
		/**
		 * The hierarchical namespace for this component that indicates it's functionality.
		 * @protected
		 * @readonly
		 * @property {String}
		 */
		"displayName" : "core/composition",

		/**
		 * Gives string representation of this component instance.
		 * @return {String} {@link #displayName}`@`{@link #instanceCount}
		 * @protected
		 */
		"toString" : function _toString() {
			var me = this;

			return me.displayName + "@" + me[INSTANCE_COUNT];
		}
	});
});
