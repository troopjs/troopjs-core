/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"../../component/config",
	"when"
], function (config, when) {
	"use strict";

	/**
	 * @class core.pubsub.runner.sequence
	 * @implement core.event.emitter.runner
	 * @mixin core.component.config
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
				// Let `context` be `candidate[CONTEXT]`
				var context = candidate[CONTEXT];

				// Return early if `context` is `UNDEFINED` or matches a blocked phase
				if (context !== UNDEFINED && SKIP.test(context[PHASE])) {
					return results;
				}

				// Apply `candidate` with `candidate[CONTEXT]` passing `args`
				// Pass result from apply to `when` and onwards to store in `results`
				return when(candidate.apply(candidate[CONTEXT], args), function (result) {
					results[index] = result;
				})
					// `yield` results for next execution
					.yield(results);
			}, candidates)
			// Remember `results`
			.tap(function (results) {
				handlers[MEMORY] = results;
			});
	}
});
