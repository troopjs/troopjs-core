/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"./initialize",
	"when"
], function (initialize, when) {
	var ARRAY_PUSH = Array.prototype.push;
	var PHASE = "phase";

	/**
	 * @class core.component.signal.start
	 * @mixin Function
	 * @static
	 */

	return function start() {
		var me = this;
		var args = arguments;

		return when(initialize.apply(me, args), function (phase) {
			var _args;

			if (phase === "initialized") {
				// Let `me[PHASE]` be `"start"`
				// Let `_args` be `[ "start" ]`
				// Push `args` on `_args`
				ARRAY_PUSH.apply(_args = [ me[PHASE] = "start" ], args);

				return me
					.signal.apply(me, _args)
					.then(function() {
						// Let `me[PHASE]` be `"started"`
						return me[PHASE] = "started";
					});
			}
			else {
				return phase;
			}
		});
	}
});