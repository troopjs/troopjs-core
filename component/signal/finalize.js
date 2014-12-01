/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"./stop",
	"when"
], function (stop, when) {
	var ARRAY_PUSH = Array.prototype.push;
	var PHASE = "phase";

	/**
	 * @class core.component.signal.finalize
	 * @implement core.component.signal
	 * @static
	 * @alias feature.signal
	 */

	/**
	 * @method constructor
	 * @inheritdoc
	 * @localdoc Transitions the component {@link core.component.base#phase} to `finalized`
	 */
	return function finalize() {
		var me = this;
		var args = arguments;

		return when(stop.apply(me, args), function (phase) {
			var _args;

			if (phase === "stopped") {
				// Let `me[PHASE]` be `"finalize"`
				// Let `_args` be `[ "sig/finalize" ]`
				// Push `args` on `_args`
				ARRAY_PUSH.apply(_args = [ "sig/" + (me[PHASE] = "finalize") ], args);

				return me
					.emit.apply(me, _args)
					.then(function() {
						// Let `me[PHASE]` be `"finalized"`
						return me[PHASE] = "finalized";
					});
			}
			else {
				return phase;
			}
		});
	}
});