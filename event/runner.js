/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([ "when/when" ], function (when) {
	"use strict";

	/**
	 * @class core.event.runner
	 * @mixin Function
	 * @private
	 * @static
	 * @alias feature.runner
	 */

	var UNDEFINED;
	var HEAD = "head";
	var NEXT = "next";

	/**
	 * Run event handlers.
	 * @method constructor
	 * @abstract
	 * @param {Object} event Event object
	 * @param {String} event.context Event context
	 * @param {Function} event.callback Event callback
	 * @param {Object} handlers List of handlers
	 * @param {Array} args Initial arguments
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
			// Run `candidate` passing `args`
			// Pass result to `when` and onwards to store in `results`
			return when(candidate.run(args), function (result) {
				results[index] = result;
			})
			// yield `results` for next execution
			.yield(results);
		}, candidates);
	}
});
