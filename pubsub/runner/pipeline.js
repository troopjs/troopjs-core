/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"./pattern",
	"when"
], function (RE_PHASE, when) {
	"use strict";

	/**
	 * @class core.pubsub.runner.pipeline
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
				// Let `context` be `candidate[CONTEXT]`
				var context = candidate[CONTEXT];

				// Return early if `context` is `UNDEFINED` or matches a blocked phase
				if (context !== UNDEFINED && RE_PHASE.test(context[PHASE])) {
					return current;
				}

				// Get object type
				var type = OBJECT_TOSTRING.call(current);

				// Calculate method depending on type
				var method = (type === TOSTRING_ARRAY || type === TOSTRING_ARGUMENTS)
					? APPLY
					: CALL;

				// Execute `candidate[CALLBACK]` using `method` in `context` passing `current`
				return when(method.call(candidate[CALLBACK], context, current), function (result) {
					// Return result defaulting to `current`
					return result === UNDEFINED
						? current
						: result;
				});
			}, args)
			// Convert and remember result
			.then(function (result) {
				// Get object type
				var type = OBJECT_TOSTRING.call(result);

				// Convert, store and return `result` in `handlers[MEMORY]`
				return handlers[MEMORY] = type === TOSTRING_ARRAY
					? result
					: type === TOSTRING_ARGUMENTS
						? ARRAY_SLICE.call(result)
						: [ result ];
			});
	}
});