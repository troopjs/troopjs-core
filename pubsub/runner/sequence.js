/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"../../config",
	"when"
], function (config, when) {
	"use strict";

	/**
	 * @class core.pubsub.runner.sequence
	 * @implement core.event.runner
	 * @mixin core.config
	 * @private
	 * @static
	 * @alias feature.runner
	 */

	var UNDEFINED;
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
	 * @localdoc Run event handlers **asynchronously** in "sequence", passing to each handler the same arguments from emitting.
	 * @return {Promise}
	 */
	return function sequence(event, handlers, args) {
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
			.reduce(candidates, function (results, candidate, index) {
				// Let `candidate_context` be `candidate[CONTEXT]`
				var candidate_context = candidate[CONTEXT];

				// Return early if `candidate_context[PHASE]` matches a blocked phase
				if (candidate_context !== UNDEFINED && SKIP.test(candidate_context[PHASE])) {
					return results;
				}

				// Run `candidate` passing `args`
				// Pass result to `when` and onwards to store in `results`
				return when(candidate.run(args), function (result) {
					results[index] = result;
				})
				// yield `results` for next execution
				.yield(results);
			}, candidates)
			// Remember `results`
			.tap(function (results) {
				handlers[MEMORY] = results;
			});
	}
});
