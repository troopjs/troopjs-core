/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"../../config",
	"when/when"
], function (config, when) {
	"use strict";

	/**
	 * @class core.pubsub.runner.pipeline
	 * @implement core.event.runner
	 * @mixin core.config
	 * @private
	 * @static
	 * @alias feature.runner
	 */

	var UNDEFINED;
	var OBJECT_TOSTRING = Object.prototype.toString;
	var ARRAY_SLICE = Array.prototype.slice;
	var TOSTRING_ARGUMENTS = "[object Arguments]";
	var TOSTRING_ARRAY = "[object Array]";
	var SKIP = config.phase.skip;
	var CONTEXT = "context";
	var CALLBACK = "callback";
	var HEAD = "head";
	var NEXT = "next";
	var PHASE = "phase";
	var MEMORY = "memory";

	/**
	 * @method constructor
	 * @inheritdoc
	 * @localdoc Runner that filters and executes candidates in pipeline without overlap
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

			candidates[candidatesCount++] = candidate;
		}

		return when
			// Reduce `candidates`
			.reduce(candidates, function (current, candidate) {
				// Let `candidate_context` be `candidate[CONTEXT]`
				var candidate_context = candidate[CONTEXT];

				// Return early if `candidate_context[PHASE]` matches a blocked phase
				if (candidate_context !== UNDEFINED && SKIP.test(candidate_context[PHASE])) {
					return current;
				}

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
			}, args)
			// Memorize
			.tap(function (result) {
				// Store `result` in `handlers[MEMORY]`
				handlers[MEMORY] = result;
			});
	}
});