/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([ "when" ], function (when) {
	"use strict";

	/**
	 * @class core.event.runner.sequence
	 * @implement core.event.emitter.runner
	 * @private
	 * @static
	 * @alias feature.runner
	 */

	var UNDEFINED;
	var HEAD = "head";
	var NEXT = "next";
	var CALLBACK = "callback";
	var CONTEXT = "context";

	/**
	 * @method constructor
	 * @inheritdoc
	 * @localdoc Run event handlers **asynchronously** in "sequence", passing to each handler the same arguments from emitting.
	 * @return {Promise}
	 */
	return function sequence(event, handlers, args) {
		var candidates = [];
		var candidatesCount = 0;
		var handler;

		// Copy from handlers list to candidates array
		for (handler = handlers[HEAD]; handler !== UNDEFINED; handler = handler[NEXT]) {
			candidates[candidatesCount++] = handler;
		}

		// Reduce `candidates`
		return when.reduce(candidates, function (results, candidate, index) {
			// Apply `candidate[CALLBACK]` with `candidate[CONTEXT]` passing `args`
			// Pass result from apply to `when` and onwards to store in `results`
			return when(candidate.apply(candidate[CONTEXT], args), function (result) {
				results[index] = result;
			})
			// `yield` results for next execution
			.yield(results);
		}, candidates);
	}
});
