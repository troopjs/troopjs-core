define([ "when" ], function (when) {
	var UNDEFINED;
	var CONTEXT = "context";
	var CALLBACK = "callback";
	var HANDLED = "handled";
	var PHASE = "phase";
	var RE_PHASE = /^(?:initi|fin)alized?$/;

	/*
	 * Constructs a function that executes handlers in sequence without overlap
	 * @param {Array} handlers Array of handlers
	 * @param {Number} handled Handled counter
	 * @param {Array} args Initial arguments
	 * @returns {Function}
	 */
	return function (handlers, handled, args) {
		var results = [];
		var resultsCount = -1;
		var handlersCount = 0;

		/*
		 * Internal function for sequential execution of handlers handlers
		 * @private
		 * @param {Array} [result] result from previous handler callback
		 * @return {Promise} promise of next handler callback execution
		 */
		var next = function (result) {
			/*jshint curly:false*/
			var handler;
			var context;

			// Store result
			results[resultsCount++] = result;

			// TODO Needs cleaner implementation
			// Iterate handlers while handler has a context and that context is in a blocked phase
			while ((handler = handlers[handlersCount++]) // Has next handler
				&& (context = handler[CONTEXT])            // Has context
				&& RE_PHASE.test(context[PHASE]));         // In blocked phase

			// Return promise of next callback, or a promise resolved with result
			return handler !== UNDEFINED
				? (handler[HANDLED] = handled) === handled && when(handler[CALLBACK].apply(context, args), next)
				: when.resolve(results);
		};

		return next(args);
	};
});