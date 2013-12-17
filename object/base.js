/*
 * TroopJS core/object/base
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([ "./factory" ], function ObjectBase(Factory) {
	var INSTANCE_COUNTER = 0;
	var INSTANCE_COUNT = "instanceCount";

	return Factory(function ObjectBase() {
		// Update instance count
		this[INSTANCE_COUNT] = ++INSTANCE_COUNTER;
	}, {
		"instanceCount" : INSTANCE_COUNTER,

		"displayName" : "core/object/base",

		/**
		 * Gives string representation of this component instance.
		 * @returns {String} displayName and instanceCount
		 */
		"toString" : function _toString() {
			var me = this;

			return me.displayName + "@" + me[INSTANCE_COUNT];
		}
	});
});