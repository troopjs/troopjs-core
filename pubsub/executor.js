/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"../config",
	"when/when"
], function (config, when) {
	"use strict";

	/**
	 * @class core.pubsub.executor
	 * @mixin Function
	 * @mixin core.config
	 * @private
	 * @static
	 * @alias feature.executor
	 */

	var UNDEFINED;
	var OBJECT_TOSTRING = Object.prototype.toString;
	var ARRAY_SLICE = Array.prototype.slice;
	var TOSTRING_ARGUMENTS = "[object Arguments]";
	var TOSTRING_ARRAY = "[object Array]";
	var SKIP = config.phase.skip;
	var SCOPE = config.emitter.scope;
	var CALLBACK = config.emitter.callback;
	var HEAD = config.emitter.head;
	var NEXT = config.emitter.next;
	var PHASE = "phase";
	var MEMORY = "memory";

	/**
	 * @method constructor
	 * @inheritdoc core.emitter.executor#constructor
	 * @localdoc
	 * - Skips handlers who's scope.{@link core.component.gadget#property-phase phase} matches {@link core.config.phase#skip}.
	 * - Executes handlers passing each handler the result from the previous.
	 * - If a handler returns `undefined` the result from the previous is used.
	 * - When all handlers are completed the end result is memorized on `handlers`
	 *
	 * @return {Promise} Promise for `[*]`
	 */
	return function (event, handlers, args) {
		var _handlers = [];
		var _handlersCount = 0;
		var scope = event[SCOPE];
		var callback = event[CALLBACK];
		var handler;

		// Iterate handlers
		for (handler = handlers[HEAD]; handler !== UNDEFINED; handler = handler[NEXT]) {
			if (callback && handler[CALLBACK] !== callback) {
				continue;
			}

			if (scope && handler[SCOPE] !== scope) {
				continue;
			}

			_handlers[_handlersCount++] = handler;
		}

		return when
			// Reduce `_handlers`
			.reduce(_handlers, function (current, _handler) {
				// Let `_scope` be `handler[SCOPE]`
				var _scope = _handler[SCOPE];

				// Return early if `_scope[PHASE]` matches a blocked phase
				if (_scope !== UNDEFINED && SKIP.test(_scope[PHASE])) {
					return current;
				}

				// Run `handler` passing `args`
				// Pass to `when` to (potentially) update `result`
				return when(_handler.handle(current), function (result) {
					// If `result` is `UNDEFINED` ...
					if (result === UNDEFINED) {
						// ... return `current` ...
						return current;
					}

					// Detect `result` type
					switch (OBJECT_TOSTRING.call(result)) {
						// `arguments` should be converted to an array
						case TOSTRING_ARGUMENTS:
							return ARRAY_SLICE.call(result);
							break;

						// `array` can be passed as-is
						case TOSTRING_ARRAY:
							return result;
							break;

						// everything else should be wrapped in an array
						default:
							return [ result ];
					}
				});
			}, args)
			// Memorize
			.tap(function (result) {
				// Store `result` in `handlers[MEMORY]`
				handlers[MEMORY] = result;
			});
	}
});