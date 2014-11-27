/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"../mixin/base",
	"./runner/sequence"
], function (Base, sequence) {
	"use strict";

	/**
	 * This event module is heart of all TroopJS event-based whistles, from the API names it's aligned with Node's events module,
	 * while behind the regularity it's powered by a highly customizable **event runner** mechanism, which makes it supports for both:
	 *
	 *  - **synchronous event**: all your event handlers are run in a single loop.
	 *  - **async event with promise**: you can return a promise where the next handler will be called upon the
	 *  completion of that promise.
	 *
	 * Event runner can even determinate the **parameters passing** strategy among handlers, which forms in two flavours:
	 *
	 *  - sequence: where each handler receives the arguments passed to {@link #method-emit}.
	 *  - pipeline: where a handler receives the return value of the previous one.
	 *
	 * @class core.event.emitter
	 * @extend core.mixin.base
	 */

	var UNDEFINED;
	var ARRAY_SLICE = Array.prototype.slice;
	var OBJECT_TOSTRING = Object.prototype.toString;
	var TOSTRING_STRING = "[object String]";
	var TOSTRING_FUNCTION = "[object Function]";
	var HANDLERS = "handlers";
	var LENGTH = "length";
	var TYPE = "type";
	var RUNNER = "runner";
	var CONTEXT = "context";
	var CALLBACK = "callback";
	var DATA = "data";
	var HEAD = "head";
	var TAIL = "tail";
	var NEXT = "next";
	var LIMIT = "limit";
	var ON = "on";
	var OFF = "off";

	/**
	 * Creates a new handler
	 * @inheritdoc #on
	 * @return {core.event.emitter.handler} Handler
	 * @ignore
	 */
	function createHandler(type, callback, data) {
		var me = this;
		var count = 0;

		var handler = function () {
			// Let `limit` be `handler[LIMIT]`
			var limit = handler[LIMIT];

			// Get result from execution of `handler[CALLBACK]`
			var result = handler[CALLBACK].apply(this, arguments);

			// If there's a `limit` and `++count` is greater or equal to it `off` the callback
			if (limit !== 0 && ++count >= limit) {
				me.off(type, callback);
			}

			// Return
			return result;
		};

		if (OBJECT_TOSTRING.call(callback) === TOSTRING_FUNCTION) {
			handler[CALLBACK] = callback;
			handler[CONTEXT] = me;
			handler[LIMIT] = 0;
		}
		else {
			handler[CALLBACK] = callback[CALLBACK];
			handler[CONTEXT] = callback[CONTEXT] || me;
			handler[LIMIT] = callback[LIMIT] || 0;

			if (callback.hasOwnProperty(ON)) {
				handler[ON] = callback[ON];
			}
			if (callback.hasOwnProperty(OFF)) {
				handler[OFF] = callback[OFF];
			}
		}

		handler[DATA] = data;

		return handler;
	}

	/**
	 * @method constructor
	 * @inheritdoc
	 */
	return Base.extend(function () {
		/**
		 * Handlers attached to this component, addressable either by key or index
		 * @private
		 * @readonly
		 * @property {core.event.emitter.handler[]} handlers
		 */
		this[HANDLERS] = [];
	}, {
		"displayName" : "core/event/emitter",

		/**
		 * Adds a listener for the specified event type.
		 * @chainable
		 * @param {String} type The event type to subscribe to.
		 * @param {Function|Object} callback The event callback to add. If callback is a function defaults from below will be used:
		 * @param {Function} callback.callback Callback method.
		 * @param {Object} [callback.context=this] Callback context.
		 * @param {Number} [callback.limit=0] Callback limit.
		 * @param {Function} [callback.on=undefined] Will be called once this handler is added to the handlers list.
		 * @param {core.event.emitter.handler} [callback.on.handler] The handler that was just added.
		 * @param {Object} [callback.on.handlers] The list of handlers the handler was added to.
		 * @param {Function} [callback.off=undefined] Will be called once this handler is removed from the handlers list.
		 * @param {core.event.emitter.handler} [callback.off.handler] The handler that was just removed.
		 * @param {Object} [callback.off.handlers] The list of handlers the handler was removed from.
		 * @param {*} [data] Handler data
		 */
		"on" : function (type, callback, data) {
			var me = this;
			var handlers;
			var handler;

			// Get callback from next arg
			if (callback === UNDEFINED) {
				throw new Error("no callback provided");
			}

			// Create new handler
			handler = createHandler.call(me, type, callback, data);

			// Have handlers
			if ((handlers = me[HANDLERS][type]) !== UNDEFINED) {
				// Set tail handler
				handlers[TAIL] = TAIL in handlers
					// Have tail, update handlers[TAIL][NEXT] to point to handler
					? handlers[TAIL][NEXT] = handler
					// Have no tail, update handlers[HEAD] to point to handler
					: handlers[HEAD] = handler;
			}
			// No handlers
			else {
				// Get HANDLERS
				handlers = me[HANDLERS];

				// Create type handlers
				handlers = handlers[handlers[LENGTH]] = handlers[type] = {};

				// Prepare handlers
				handlers[TYPE] = type;
				handlers[HEAD] = handlers[TAIL] = handler;
			}

			// If we have an `ON` callback ...
			if (handler.hasOwnProperty(ON)) {
				// .. call it in the context of `me`
				handler[ON].call(me, handler, handlers);
			}

			return me;
		},

		/**
		 * Remove callback(s) from a subscribed event type, if no callback is specified,
		 * remove all callbacks of this type.
		 * @chainable
		 * @param {String} type The event type subscribed to
		 * @param {Function|Object} [callback] The event callback to remove. If callback is a function context will be this, otherwise:
		 * @param {Function} [callback.callback] Callback method to match.
		 * @param {Object} [callback.context=this] Callback context to match.
		 */
		"off" : function (type, callback) {
			var me = this;
			var _callback;
			var _context;
			var handlers;
			var handler;
			var head;
			var tail;

			// Have handlers
			if ((handlers = me[HANDLERS][type]) !== UNDEFINED) {
				// Have HEAD in handlers
				if (HEAD in handlers) {
					if (OBJECT_TOSTRING.call(callback) === TOSTRING_FUNCTION) {
						_callback = callback;
						_context = me;
					}
					else if (callback !== UNDEFINED) {
						_callback = callback[CALLBACK];
						_context = callback[CONTEXT];
					}

					// Iterate handlers
					for (handler = handlers[HEAD]; handler !== UNDEFINED; handler = handler[NEXT]) {
						// Should we remove?
						remove : {
							// If no context or context does not match we should break
							if (_context && handler[CONTEXT] !== _context) {
								break remove;
							}

							// If no callback or callback does not match we should break
							if (_callback && handler[CALLBACK] !== _callback) {
								break remove;
							}

							// If we have an `OFF` callback ...
							if (handler.hasOwnProperty(OFF)) {
								// .. call it in the context of `me`
								handler[OFF].call(me, handler, handlers);
							}

							// Remove this handler, just continue
							continue;
						}

						// It there's no head - link head -> tail -> handler
						if (!head) {
							head = tail = handler;
						}
						// Otherwise just link tail -> tail[NEXT] -> handler
						else {
							tail = tail[NEXT] = handler;
						}
					}

					// If we have both head and tail we should update handlers
					if (head && tail) {
						// Set handlers HEAD and TAIL
						handlers[HEAD] = head;
						handlers[TAIL] = tail;

						// Make sure to remove NEXT from tail
						delete tail[NEXT];
					}
					// Otherwise we remove the handlers list
					else {
						delete handlers[HEAD];
						delete handlers[TAIL];
					}
				}
			}

			return me;
		},

		/**
		 * Adds a listener for the specified event type exactly once.
		 * @method one
		 * @chainable
		 * @inheritdoc #on
		 */
		"one": function (type, callback, data) {
			var me = this;
			var _callback;

			if (OBJECT_TOSTRING.call(callback) === TOSTRING_FUNCTION) {
				_callback = {};
				_callback[CALLBACK] = callback;
				_callback[LIMIT] = 1;
			}
			else {
				_callback = callback;
				_callback[LIMIT] = 1;
			}

			// Delegate return to `on`
			return me.on(type, _callback, data);
		},

		/**
		 * Trigger an event which notifies each of the listeners of their subscribing,
		 * optionally pass data values to the listeners.
		 *
		 *  A sequential runner, is the default runner for this module, in which all handlers are running
		 *  with the same argument data specified by the {@link #emit} function.
		 *  Each handler will wait for the completion for the previous one if it returns a promise.
		 *
		 * @param {String|Object} event The event type to emit, or an event object
		 * @param {String} [event.type] The event type name.
		 * @param {Function} [event.runner] The runner function that determinate how the handlers are executed, overrides the
		 * default behaviour of the event emitting.
		 * @param {...*} [args] Data params that are passed to the listener function.
		 * @return {*} Result returned from runner.
		 */
		"emit" : function (event, args) {
			var me = this;
			var type = event;
			var handlers;
			var runner;

			// If event is a plain string, convert to object with props
			if (OBJECT_TOSTRING.call(event) === TOSTRING_STRING) {
				// Recreate event
				event = {};
				event[RUNNER] = runner = sequence;
				event[TYPE] = type;
			}
			// If event duck-types an event object we just override or use defaults
			else if (TYPE in event) {
				event[RUNNER] = runner = event[RUNNER] || sequence;
				type = event[TYPE];
			}
			// Otherwise something is wrong
			else {
				throw Error("first argument has to be of type '" + TOSTRING_STRING + "' or have a '" + TYPE + "' property");
			}

			// Get handlers[type] as handlers
			if ((handlers = me[HANDLERS][type]) === UNDEFINED) {
				// Get HANDLERS
				handlers = me[HANDLERS];

				// Create type handlers
				handlers = handlers[handlers[LENGTH]] = handlers[type] = {};

				// Prepare handlers
				handlers[TYPE] = type;
			}

			// Return result from runner
			return runner.call(me, event, handlers, ARRAY_SLICE.call(arguments, 1));
		}
	});
});
