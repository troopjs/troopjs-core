/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([ "poly/array" ], function () {
	"use strict";

	/**
	 * @class core.component.runner.sequence
	 * @implement core.event.emitter.runner
	 * @private
	 * @static
	 * @alias feature.runner
	 */

	var UNDEFINED;
	var FALSE = false;
	var HEAD = "head";
	var NEXT = "next";
	var CALLBACK = "callback";
	var CONTEXT = "context";

	/**
	 * @method constructor
	 * @inheritdoc
	 * @localdoc Run event handlers **synchronously** in "sequence", passing to each handler the same arguments from emitting.
	 * @return {*[]} Result from each executed handler
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

		// Reduce and return
		return candidates.reduce(function (current, candidate) {
			var result = current !== FALSE
				? candidate[CALLBACK].apply(candidate[CONTEXT], args)
				: current;

			return result === UNDEFINED
				? current
				: result;
		}, UNDEFINED);
	}
});
