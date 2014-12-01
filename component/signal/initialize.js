/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([ "when" ], function (when) {
	var UNDEFINED;
	var ARRAY_PUSH = Array.prototype.push;
	var PHASE = "phase";

	/**
	 * @class core.component.signal.initialize
	 * @implement core.component.signal
	 * @static
	 * @alias feature.signal
	 */

	/**
	 * @method constructor
	 * @inheritdoc
	 * @localdoc Transitions the component {@link core.component.base#phase} to `initialized`
	 */

	return function initialize() {
		var me = this;
		var args = arguments;

		return when(me[PHASE], function (phase) {
			var _args;

			if (phase === UNDEFINED) {
				// Let `me[PHASE]` be `"initialize"`
				// Let `_args` be `[ "sig/initialize" ]`
				// Push `args` on `_args`
				ARRAY_PUSH.apply(_args = [ "sig/" + (me[PHASE] = "initialize") ], args);

				return me
					.emit.apply(me, _args)
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