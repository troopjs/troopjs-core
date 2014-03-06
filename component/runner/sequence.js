/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([ "poly/array" ], function SequenceModule() {
	"use strict";

	/**
	 * @class core.component.runner.sequence
	 * @extends core.event.emitter.runner
	 * @protected
	 * @singleton
	 */

	var UNDEFINED;
	var HEAD = "head";
	var NEXT = "next";
	var CALLBACK = "callback";
	var CONTEXT = "context";

	/**
	 * @method constructor
	 * @inheritdoc
	 * @localdoc Run event handlers **synchronously** in "sequence", passing to each handler the same arguments from emitting.
	 * @returns {*[]} Result from each executed handler
	 */
	return function sequence(event, handlers, args) {
		var context = event[CONTEXT];
		var callback = event[CALLBACK];
		var candidate;
		var candidates = [];
		var candidatesCount = 0;

		// Iterate handlers
		for (candidate = handlers[HEAD]; candidate !== UNDEFINED; candidate = candidate[NEXT]) {
			// Filter candidate[CONTEXT] if we have context
			if (context !== UNDEFINED && candidate[CONTEXT] !== context) {
				continue;
			}

			// Filter candidate[CALLBACK] if we have callback
			if (callback && candidate[CALLBACK] !== callback) {
				continue;
			}

			candidates[candidatesCount++] = candidate;
		}

		// Map and return
		return candidates.map(function (candidate) {
			return candidate[CALLBACK].apply(candidate[CONTEXT], args);
		});
	}
});
