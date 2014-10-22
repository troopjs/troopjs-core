/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([ "when" ], function (when) {
	var UNDEFINED;
	var ARRAY_PUSH = Array.prototype.push;
	var PHASE = "phase";

	/**
	 * @class core.component.signal.initialize
	 * @mixin Function
	 * @static
	 */

	return function initialize() {
		var me = this;
		var args = arguments;

		return when(me[PHASE], function (phase) {
			var _args;

			if (phase === UNDEFINED) {
				// Let `me[PHASE]` be `"initialize"`
				// Let `_args` be `[ "initialize" ]`
				// Push `args` on `_args`
				ARRAY_PUSH.apply(_args = [ me[PHASE] = "initialize" ], args);

				return me
					.signal.apply(me, _args)
					.then(function() {
						// Let `me[PHASE]` be `"initialized"`
						return me[PHASE] = "initialized";
					});
			}
			else {
				return phase;
			}
		});
	}
});