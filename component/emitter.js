/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"../event/emitter",
	"../config",
	"./registry",
	"./runner/sequence",
	"../task/factory",
	"mu-merge",
	"troopjs-compose/decorator/around",
	"when",
	"poly/array"
], function (Emitter, config, registry, sequence, taskFactory, merge, around, when) {
	"use strict";

	/**
	 * Component emitter
	 * @class core.component.emitter
	 * @extend core.event.emitter
	 * @mixin core.config
	 * @alias feature.component
	 */

	var UNDEFINED;
	var FALSE = false;
	var ARRAY_PROTO = Array.prototype;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var RUNNER = "runner";
	var HANDLERS = "handlers";
	var HEAD = "head";
	var TAIL = "tail";
	var NAME = "name";
	var TYPE = "type";
	var VALUE = "value";
	var ON = "on";
	var ONE = "one";
	var SIG = "sig";
	var SIG_SETUP = config.signal.setup;
	var SIG_ADD = config.signal.add;
	var SIG_REMOVE = config.signal.remove;
	var SIG_TEARDOWN = config.signal.teardown;
	var SIG_TASK = config.signal.task;
	var SIG_PATTERN = new RegExp("^" + SIG + "/(.+)");

	/**
	 * Current lifecycle phase
	 * @protected
	 * @readonly
	 * @property {core.config.phase} phase
	 */

	/**
	 * Setup signal
	 * @event sig/setup
	 * @localdoc Triggered when the first event handler of a particular type is added via {@link #method-on}.
	 * @since 3.0
	 * @preventable
	 * @param {Object} handlers
	 * @param {String} type
	 * @param {Function} callback
	 * @param {*} [data]
	 */

	/**
	 * Add signal
	 * @event sig/add
	 * @localdoc Triggered when a event handler of a particular type is added via {@link #method-on}.
	 * @since 3.0
	 * @preventable
	 * @param {Object} handlers
	 * @param {String} type
	 * @param {Function} callback
	 * @param {*} [data]
	 */

	/**
	 * Remove signal
	 * @event sig/remove
	 * @localdoc Triggered when a event handler of a particular type is removed via {@link #method-off}.
	 * @since 3.0
	 * @preventable
	 * @param {Object} handlers
	 * @param {String} type
	 * @param {Function} callback
	 */

	/**
	 * Teardown signal
	 * @event sig/teardown
	 * @localdoc Triggered when the last event handler of type is removed for a particular type via {@link #method-off}.
	 * @since 3.0
	 * @preventable
	 * @param {Object} handlers
	 * @param {String} type
	 * @param {Function} callback
	 */

	/**
	 * Initialize signal
	 * @event sig/initialize
	 * @localdoc Triggered when this component enters the initialize phase
	 * @param {...*} [args] Initialize arguments
	 */

	/**
	 * Start signal
	 * @event sig/start
	 * @localdoc Triggered when this component enters the start phase
	 * @param {...*} [args] Initialize arguments
	 */

	/**
	 * Stop signal
	 * @event sig/stop
	 * @localdoc Triggered when this component enters the stop phase
	 * @param {...*} [args] Stop arguments
	 */

	/**
	 * Finalize signal
	 * @event sig/finalize
	 * @localdoc Triggered when this component enters the finalize phase
	 * @param {...*} [args] Finalize arguments
	 */

	/**
	 * Task signal
	 * @event sig/task
	 * @localdoc Triggered when this component starts a {@link #method-task}.
	 * @param {Promise} task Task
	 * @param {String} name Task name
	 * @return {Promise}
	 */

	/**
	 * Handles the component start
	 * @handler sig/start
	 * @inheritdoc #event-sig/start
	 * @template
	 * @return {Promise}
	 */

	/**
	 * Handles the component stop
	 * @handler sig/stop
	 * @inheritdoc #event-sig/stop
	 * @template
	 * @return {Promise}
	 */

	/**
	 * Handles an event setup
	 * @handler sig/setup
	 * @inheritdoc #event-sig/setup
	 * @template
	 * @return {*|Boolean}
	 */

	/**
	 * Handles an event add
	 * @handler sig/add
	 * @inheritdoc #event-sig/add
	 * @template
	 * @return {*|Boolean}
	 */

	/**
	 * Handles an event remove
	 * @handler sig/remove
	 * @inheritdoc #event-sig/remove
	 * @template
	 * @return {*|Boolean}
	 */

	/**
	 * Handles an event teardown
	 * @handler sig/teardown
	 * @inheritdoc #event-sig/teardown
	 * @template
	 * @return {*|Boolean}
	 */

	/**
	 * @method one
	 * @chainable
	 * @inheritdoc
	 * @localdoc Adds support for {@link #event-sig/setup} and {@link #event-sig/add}.
	 * @fires sig/setup
	 * @fires sig/add
	 */

	/**
	 * @method constructor
	 * @inheritdoc
	 */
	return Emitter.extend(function Component() {
		var me = this;
		var specials = me.constructor.specials[SIG] || ARRAY_PROTO;

		// Iterate specials
		specials.forEach(function (special) {
			me.on(special[NAME], special[VALUE]);
		});
	}, {
		"displayName" : "core/component/base",

		/**
		 * Handles the component initialization.
		 * @inheritdoc #event-sig/initialize
		 * @localdoc Registers event handlers declared ON specials
		 * @handler
		 * @return {Promise}
		 */
		"sig/initialize" : function () {
			var me = this;
			var specials = me.constructor.specials;

			// Register component
			registry.register(me.toString(), me);

			// Initialize ON specials
			var specials_on = when.map(specials[ON] || ARRAY_PROTO, function (special) {
				return me.on(special[TYPE], special[VALUE]);
			});

			// Initialize ONE specials
			var specials_one = when.map(specials[ONE] || ARRAY_PROTO, function (special) {
				return me.one(special[TYPE], special[VALUE]);
			});

			// Join and return
			return when.join(specials_on, specials_one);
		},

		/**
		 * Handles the component finalization.
		 * @inheritdoc #event-sig/finalize
		 * @localdoc Un-registers all handlers
		 * @handler
		 * @return {Promise}
		 */
		"sig/finalize" : function () {
			var me = this;

			// Un-register component
			registry.unregister(me.toString(), me);

			// Finalize all handlers, in reverse
			return when.map(me[HANDLERS].reverse(), function (handlers) {
				return me.off(handlers[TYPE]);
			});
		},

		/**
		 * @chainable
		 * @method
		 * @inheritdoc
		 * @localdoc Adds support for {@link #event-sig/setup} and {@link #event-sig/add}.
		 * @fires sig/setup
		 * @fires sig/add
		 */
		"on": around(function (fn) {
			return function (type, callback, data) {
				var me = this;
				var event;
				var handlers;
				var result;

				// If this type is NOT a signal we don't have to event try
				if (!SIG_PATTERN.test(type)) {
					// Initialize the handlers for this type if they don't exist.
					if ((handlers = me[HANDLERS][type]) === UNDEFINED) {
						handlers = {};
						handlers[TYPE] = type;
					}

					// Initialize event
					event = {};
					event[RUNNER] = sequence;

					// If this is the first handler signal SIG_SETUP
					if (!(HEAD in handlers)) {
						event[TYPE] = SIG_SETUP;
						result = me.emit(event, handlers, type, callback, data);
					}

					// If we were not interrupted
					if (result !== FALSE) {
						// Signal SIG_ADD
						event[TYPE] = SIG_ADD;
						result = me.emit(event, handlers, type, callback, data);
					}

					// If we were not interrupted and `handlers` is not the list for `type` append it
					if (result !== FALSE && me[HANDLERS][type] !== handlers) {
						ARRAY_PUSH.call(me[HANDLERS], me[HANDLERS][type] = handlers);
					}
				}

				// If we were not interrupted return result from super.on, otherwise just this
				return result !== FALSE
						? fn.call(me, type, callback, data)
						: me;
			};
		}),

		/**
		 * @chainable
		 * @method
		 * @inheritdoc
		 * @localdoc Adds support for {@link #event-sig/remove} and {@link #event-sig/teardown}.
		 * @fires sig/remove
		 * @fires sig/teardown
		 */
		"off": around(function(fn) {
			return function off(type, callback) {
				var me = this;
				var event;
				var handlers;
				var result;

				if (!SIG_PATTERN.test(type)) {
					// Initialize the handlers for this type if they don't exist.
					if ((handlers = me[HANDLERS][type]) === UNDEFINED) {
						handlers = {};
						handlers[TYPE] = type;
					}

					// Initialize event
					event = {};
					event[RUNNER] = sequence;

					// Signal SIG_REMOVE
					event[TYPE] = SIG_REMOVE;
					result = me.emit(event, handlers, type, callback);

					// If we were not interrupted and this is the last handler signal SIG_TEARDOWN
					if (result !== FALSE && handlers[HEAD] === handlers[TAIL]) {
						event[TYPE] = SIG_TEARDOWN;
						result = me.emit(event, handlers, type, callback);
					}

					// If we were not interrupted and `handlers` is not the list for `type` append it
					if (result !== FALSE && me[HANDLERS][type] !== handlers) {
						ARRAY_PUSH.call(me[HANDLERS], me[HANDLERS][type] = handlers);
					}
				}

				// If we were not interrupted return result from super.off, otherwise just this
				return result !== FALSE
					? fn.call(me, type, callback)
					: me;
			};
		}),

		/**
		 * Schedule a new promise that runs on this component, sends a {@link #event-sig/task} once finished.
		 * @param {Promise|Resolver} promiseOrResolver The task resolver.
		 * @param {String} [name] Task name
		 * @return {Promise}
		 * @fires sig/task
		 */
		"task" : function (promiseOrResolver, name) {
			var me = this;

			// Create task
			var task = taskFactory.call(me, promiseOrResolver, name);

			// Signal `SIG_TASK` and yield `task`
			return me.emit(SIG_TASK, task, name).yield(task);
		}
	});
});
