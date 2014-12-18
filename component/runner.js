/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([ "poly/array" ], function () {
	"use strict";

	/**
	 * @class core.component.runner
	 * @mixin Function
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
	 * @inheritdoc core.event.runner#constructor
	 * @localdoc
	 * - Runs event handlers synchronously passing each handler `args`.
	 * - Anything returned from a handler except `undefined` will be stored as `result`
	 * - If a handler returns `undefined` the current `result` will be kept
	 * - If a handler returns `false` no more handlers will be executed.
	 *
	 * @return {*} Stored `result`
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
				? candidate.run(args)
				: current;

			return result === UNDEFINED
				? current
				: result;
		}, UNDEFINED);
	}
});
