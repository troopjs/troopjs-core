/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([ "when" ], function (when) {
	"use strict";

	/**
	 * @class core.component.runner.pipeline
	 * @implement core.event.emitter.runner
	 * @private
	 * @static
	 * @alias feature.runner
	 */

	var UNDEFINED;
	var FUNCTION_PROTO = Function.prototype;
	var APPLY = FUNCTION_PROTO.apply;
	var CALL = FUNCTION_PROTO.call;
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
				// Get object type
				var type = OBJECT_TOSTRING.call(current);

				// Calculate method depending on type
				var method = (type === TOSTRING_ARRAY || type === TOSTRING_ARGUMENTS)
					? APPLY
					: CALL;

				// Execute `candidate[CALLBACK]` using `method` in `context` passing `current`
				return method.call(candidate[CALLBACK], context, current);
			}, args)
			// Convert result
			.then(function (result) {
				// Get object type
				var type = OBJECT_TOSTRING.call(result);

				// Convert and return `result`
				return type === TOSTRING_ARRAY
					? result
					: type === TOSTRING_ARGUMENTS
						? ARRAY_SLICE.call(result)
						: [ result ];
			});
	}
});
