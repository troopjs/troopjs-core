define([ "when" ], function (when) {
	var CONTEXT = "context";
	var CALLBACK = "callback";
	var LENGTH = "length";
	var HANDLED = "handled";

	/*
	 * Constructs a function that executes handlers in sequence without overlap
	 * @private
	 * @param {Array} handlers Array of handlers
	 * @param {Number} handled Handled counter
	 * @param {Array} [result=[]] Result array
	 * @returns {Function}
	 */
	return function (handlers, handled, result) {
		// Default value for result
		result = result || [];

		var handlersCount = 0;
		var resultLength = result[LENGTH];
		var resultCount = resultLength - 1;

		/*
		 * Internal function for sequential execution of handlers handlers
		 * @private
		 * @param {Array} [args] result from previous handler callback
		 * @return {Promise} promise of next handler callback execution
		 */
		var next = function (args) {
			/*jshint curly:false*/
			var context;
			var handler;

			// Store result
			if (resultCount++ >= resultLength) {
				result[resultCount] = args;
			}

			// Return promise of next callback, or a promise resolved with result
			return (handler = handlers[handlersCount++])
				? (handler[HANDLED] = handled) === handled && when(handler[CALLBACK].apply(handler[CONTEXT], args), next)
				: when.resolve(result);
		};

		return next;
	};
});