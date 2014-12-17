/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([ "when" ], function (when) {
	"use strict";

	/**
	 * @class core.component.runner.pipeline
	 * @implement core.event.runner
	 * @private
	 * @static
	 * @alias feature.runner
	 */

	var UNDEFINED;
	var OBJECT_TOSTRING = Object.prototype.toString;
	var TOSTRING_ARGUMENTS = "[object Arguments]";
	var TOSTRING_ARRAY = "[object Array]";
	var ARRAY_SLICE = Array.prototype.slice;
	var CONTEXT = "context";
	var CALLBACK = "callback";
	var HEAD = "head";
	var NEXT = "next";

	/**
	 * @method constructor
	 * @inheritdoc
	 * @localdoc Run event handlers **asynchronously** in "pipeline", passing the resolved return value (unless it's undefined) of the previous listen to the next handler as arguments.
	 * @return {Promise}
	 */
	return function pipeline(event, handlers, args) {
		var context = event[CONTEXT];
		var callback = event[CALLBACK];
		var candidate;
		var candidates = [];
		var candidatesCount = 0;

		// Iterate handlers
		for (candidate = handlers[HEAD]; candidate !== UNDEFINED; candidate = candidate[NEXT]) {
			if (
				// Filter `candidate[CONTEXT]` if we have `context`
			(context !== UNDEFINED && candidate[CONTEXT] !== context) ||
				// Filter `candidate[CALLBACK]` if we have `callback`
			(callback !== UNDEFINED && candidate[CALLBACK] !== callback)
			) {
				continue;
			}

			// Add to candidates
			candidates[candidatesCount++] = candidate;
		}

		return when
			// Reduce `candidates`
			.reduce(candidates, function (current, candidate) {
				// Run `candidate` passing `args`
				// Pass to `when` to (potentially) update `result`
				return when(candidate.run(current), function (result) {
					// If `result` is `UNDEFINED` ...
					if (result === UNDEFINED) {
						// ... return `current` ...
						return current;
					}

					// Detect `result` type
					switch (OBJECT_TOSTRING.call(result)) {
						// `arguments` should be converted to an array
						case TOSTRING_ARGUMENTS:
							return ARRAY_SLICE.call(result);
							break;

						// `array` can be passed as-is
						case TOSTRING_ARRAY:
							return result;
							break;

						// everything else should be wrapped in an array
						default:
							return [ result ];
					}
				});
			}, args);
	}
});
