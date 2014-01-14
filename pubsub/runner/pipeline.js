define([ "when" ], function (when) {
	var UNDEFINED;
	var CONTEXT = "context";
	var CALLBACK = "callback";
	var HANDLED = "handled";
	var MEMORY = "memory";
	var PHASE = "phase";
	var RE_PHASE = /^(?:initi|fin)alized?$/;

	/*
	 * Constructs a function that executes handlers in a pipeline without overlap
	 * @param {Array} handlers Array of handlers
	 * @param {Number} handled Handled counter
	 * @param {Array} args Initial arguments
	 * @returns {Function}
	 */
	return function (handlers, handled, args) {
		var me = this;
		var handlersCount = 0;

		/*
		 * Internal function for piped execution of handlers handlers
		 * @private
		 * @param {Array} [result] result from previous handler callback
		 * @return {Promise} promise of next handler callback execution
		 */
		var next = function (result) {
			/*jshint curly:false*/
			var context;
			var handler;

			// Check that we have result
			if (result !== UNDEFINED) {
				// Update memory and args
				me[MEMORY] = args = result;
			}

			// TODO Needs cleaner implementation
			// Iterate until we find a handler in a blocked phase
			while ((handler = handlers[handlersCount++]) // Has next handler
				&& (context = handler[CONTEXT])            // Has context
				&& RE_PHASE.test(context[PHASE]));         // In blocked phase

			// Return promise of next callback, or promise resolved with args
			return handler !== UNDEFINED
				? (handler[HANDLED] = handled) === handled && when(handler[CALLBACK].apply(context, args), next)
				: when.resolve(args);
		};

		return next(args);
	}
});