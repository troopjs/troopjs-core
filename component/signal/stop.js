/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"./start",
	"when"
], function (start, when) {
	var ARRAY_PUSH = Array.prototype.push;
	var PHASE = "phase";

	/**
	 * @class core.component.signal.stop
	 * @implement core.component.signal
	 * @static
	 * @alias feature.signal
	 */

	/**
	 * @method constructor
	 * @inheritdoc
	 * @localdoc Transitions the component {@link core.component.base#phase} to `stopped`
	 */

	return function stop() {
		var me = this;
		var args = arguments;

		return when(start.apply(me, args), function (phase) {
			var _args;

			if (phase === "started") {
				// Let `me[PHASE]` be `"stop"`
				// Let `_args` be `[ "stop" ]`
				// Push `args` on `_args`
				ARRAY_PUSH.apply(_args = [ me[PHASE] = "stop" ], args);

				return me
					.signal.apply(me, _args)
					.then(function () {
						// Let `me[PHASE]` be `"stopped"`
						return me[PHASE] = "stopped";
					});
			}
			else {
				return phase;
			}
		});
	}
});