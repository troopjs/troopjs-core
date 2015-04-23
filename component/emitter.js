/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
  "../emitter/composition",
  "../config",
  "./registry",
  "./executor",
  "../task/factory",
  "mu-merge/main",
  "troopjs-compose/decorator/around"
], function (Emitter, config, registry, executor, taskFactory, merge, around) {
  "use strict";

  /**
   * Component emitter
   * @class core.component.emitter
   * @extend core.emitter.composition
   * @mixin core.config
   * @alias feature.component
   */

  var UNDEFINED;
  var FALSE = false;
  var EXECUTOR = config.emitter.executor;
  var HANDLERS = config.emitter.handlers;
  var HEAD = config.emitter.head;
  var TAIL = config.emitter.tail;
  var SIG_SETUP = config.signal.setup;
  var SIG_ADD = config.signal.add;
  var SIG_ADDED = config.signal.added;
  var SIG_REMOVE = config.signal.remove;
  var SIG_REMOVED = config.signal.removed;
  var SIG_TEARDOWN = config.signal.teardown;
  var SIG_TASK = config.signal.task;
  var PHASE = "phase";
  var ARGS = "args";
  var NAME = "name";
  var TYPE = "type";
  var VALUE = "value";
  var LENGTH = "length";
  var ON = "on";
  var ONE = "one";
  var SIG = "sig";
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
   * @param {...*} [args] Setup arguments
   */

  /**
   * Add signal
   * @event sig/add
   * @localdoc Triggered before an event handler of a particular type is added via {@link #method-on}.
   * @since 3.0
   * @preventable
   * @param {Object} handlers
   * @param {String} type
   * @param {Function} callback
   * @param {...*} [args] Add arguments
   */

  /**
   * Added signal
   * @event sig/added
   * @localdoc Triggered when a event handler of a particular type is added via {@link #method-on}.
   * @since 3.0
   * @param {Object} handlers The list of handlers the handler was added to.
   * @param {core.emitter.handler} handler The handler that was just added.
   */

  /**
   * Remove signal
   * @event sig/remove
   * @localdoc Triggered before an event handler of a particular type is removed via {@link #method-off}.
   * @since 3.0
   * @preventable
   * @param {Object} handlers
   * @param {String} type
   * @param {Function} callback
   * @param {...*} [args] Removed arguments
   */

  /**
   * Removed signal
   * @event sig/removed
   * @localdoc Triggered when a event handler of a particular type is removed via {@link #method-off}.
   * @since 3.0
   * @param {Object} handlers The list of handlers the handler was removed from.
   * @param {core.emitter.handler} handler The handler that was just removed.
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
   * @param {...*} [args] Teardown arguments
   */

  /**
   * Initialize signal
   * @event sig/initialize
   * @localdoc Triggered when this component enters the initialize {@link #property-phase}
   * @param {...*} [args] Initialize arguments
   */

  /**
   * Start signal
   * @event sig/start
   * @localdoc Triggered when this component enters the start {@link #property-phase}
   * @param {...*} [args] Initialize arguments
   */

  /**
   * Stop signal
   * @event sig/stop
   * @localdoc Triggered when this component enters the stop {@link #property-phase}
   * @param {...*} [args] Stop arguments
   */

  /**
   * Finalize signal
   * @event sig/finalize
   * @localdoc Triggered when this component enters the finalize {@link #property-phase}
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
   * @inheritdoc
   * @localdoc Adds support for {@link #event-sig/setup} and {@link #event-sig/add}.
   * @fires sig/setup
   * @fires sig/add
   */

  /**
   * @method constructor
   * @inheritdoc
   */
  return Emitter.extend(function () {
    var me = this;
    var specials = me.constructor.specials;

    // Set initial phase to `UNDEFINED`
    me[PHASE] = UNDEFINED;

    // Iterate SIG specials
    if (specials.hasOwnProperty(SIG)) {
      specials[SIG].forEach(function (special) {
        var args;

        if ((args = special[ARGS]) !== UNDEFINED && args[LENGTH] > 0) {
          me.on.apply(me, [ special[NAME], special[VALUE] ].concat(special[ARGS]));
        }
        else {
          me.on(special[NAME], special[VALUE]);
        }
      });
    }
  }, {
    "displayName": "core/component/base",

    /**
     * Handles the component initialization.
     * @inheritdoc #event-sig/initialize
     * @localdoc Registers event handlers declared ON specials
     * @handler
     * @return {Promise}
     */
    "sig/initialize": function () {
      var me = this;
      var specials = me.constructor.specials;

      // Register component
      registry.register(me.toString(), me);

      // Initialize ON specials
      if (specials.hasOwnProperty(ON)) {
        specials[ON].forEach(function (special) {
          var args;

          if ((args = special[ARGS]) !== UNDEFINED && args[LENGTH] > 0) {
            me.on.apply(me, [ special[TYPE], special[VALUE] ].concat(special[ARGS]));
          }
          else {
            me.on(special[TYPE], special[VALUE]);
          }
        });
      }

      // Initialize ONE specials
      if (specials.hasOwnProperty(ONE)) {
        specials[ONE].forEach(function (special) {
          var args;

          if ((args = special[ARGS]) !== UNDEFINED && args[LENGTH] > 0) {
            me.one.apply(me, [ special[TYPE], special[VALUE] ].concat(special[ARGS]));
          }
          else {
            me.one(special[TYPE], special[VALUE]);
          }
        });
      }
    },

    /**
     * Handles the component finalization.
     * @inheritdoc #event-sig/finalize
     * @localdoc Un-registers all handlers
     * @handler
     * @return {Promise}
     */
    "sig/finalize": function () {
      var me = this;

      // Un-register component
      registry.unregister(me.toString(), me);

      // Finalize all handlers
      Object
        .keys(me[HANDLERS])
        .forEach(function (type) {
          me.off(type);
        });
    },

    /**
     * @method
     * @inheritdoc
     * @localdoc Adds support for {@link #event-sig/setup}, {@link #event-sig/add} and {@link #event-sig/added}.
     * @fires sig/setup
     * @fires sig/add
     * @fires sig/added
     */
    "on": around(function (fn) {
      return function (type, callback) {
        var me = this;
        var handlers = me[HANDLERS];
        var length;
        var args;
        var event;
        var result;
        var _handlers;

        // If this type is NOT a signal we don't have to event try ...
        if (!SIG_PATTERN.test(type)) {
          // Get or initialize the handlers for this type
          if (handlers.hasOwnProperty(type)) {
            _handlers = handlers[type];
          }
          else {
            _handlers = {};
            _handlers[TYPE] = type;
          }

          // Initialize event
          event = {};
          event[EXECUTOR] = executor;

          // Get `arguments[LENGTH]`
          length = arguments[LENGTH];

          // Check if rest arguments was passed
          if (length > 2) {
            // Let `args` be `[ event, _handlers ]`
            args = [ event, _handlers ];

            // Copy values from `arguments`
            while (length--) {
              args[length + 2] = arguments[length];
            }
          }

          // If this is the first handler signal SIG_SETUP
          if (!_handlers.hasOwnProperty(HEAD)) {
            event[TYPE] = SIG_SETUP;
            result = args !== UNDEFINED
              ? me.emit.apply(me, args)
              : me.emit(event, _handlers, type, callback);
          }

          // If we were not interrupted
          if (result !== FALSE) {
            // Signal SIG_ADD
            event[TYPE] = SIG_ADD;
            result = args !== UNDEFINED
              ? me.emit.apply(me, args)
              : me.emit(event, _handlers, type, callback);

            // If we were not interrupted
            if (result !== FALSE) {
              // If `type` is not in `handlers` put it there
              if (!handlers.hasOwnProperty(type)) {
                handlers[type] = _handlers;
              }

              // Call `super.on`
              result = fn.apply(me, arguments);

              // Signal SIG_ADDED
              event[TYPE] = SIG_ADDED;
              if (args !== UNDEFINED) {
                length = args[LENGTH];

                while (length-- > 2) {
                  args[length + 1] = args[length];
                }

                args[2] = result;

                me.emit.apply(me, args);
              }
              else {
                me.emit(event, _handlers, result);
              }
            }
          }
        }
        // .. just call `super.on`
        else {
          result = fn.apply(me, arguments);
        }

        // Return `result`
        return result;
      };
    }),

    /**
     * @method
     * @inheritdoc
     * @localdoc Adds support for {@link #event-sig/remove}, {@link #event-sig/removed} and {@link #event-sig/teardown}.
     * @fires sig/remove
     * @fires sig/removed
     * @fires sig/teardown
     */
    "off": around(function (fn) {
      return function (type, callback) {
        var me = this;
        var handlers = me[HANDLERS];
        var length;
        var args;
        var event;
        var result;
        var _handlers;

        if (!SIG_PATTERN.test(type)) {
          // Get or initialize the handlers for this type
          if (handlers.hasOwnProperty(type)) {
            _handlers = handlers[type];
          }
          else {
            _handlers = {};
            _handlers[TYPE] = type;
          }

          // Initialize event
          event = {};
          event[EXECUTOR] = executor;

          // Get `arguments[LENGTH]`
          length = arguments[LENGTH];

          // Check if rest arguments was passed
          if (length > 2) {
            // Let `args` be `[ event, _handlers ]`
            args = [ event, _handlers ];

            // Copy values from `arguments`
            while (length--) {
              args[length + 2] = arguments[length];
            }
          }

          // Signal SIG_REMOVE
          event[TYPE] = SIG_REMOVE;
          result = args !== UNDEFINED
            ? me.emit.apply(me, args)
            : me.emit(event, _handlers, type, callback);

          // If we were not interrupted
          if (result !== FALSE) {
            // If this is the last handler signal SIG_TEARDOWN
            if (_handlers[HEAD] === _handlers[TAIL]) {
              event[TYPE] = SIG_TEARDOWN;
              result = args !== UNDEFINED
                ? me.emit.apply(me, args)
                : me.emit(event, _handlers, type, callback);
            }

            // If we were not interrupted
            if (result !== FALSE) {
              // If `type` is not in `handlers` put it there
              if (!handlers.hasOwnProperty(type)) {
                handlers[type] = _handlers;
              }

              // Call `super.off`
              result = fn.apply(me, arguments);

              // Signal SIG_REMOVED
              event[TYPE] = SIG_REMOVED;
              if (args !== UNDEFINED) {
                length = args[LENGTH];

                while (length-- > 2) {
                  args[length + 1] = args[length];
                }

                result.forEach(function (handler) {
                  args[2] = handler;

                  me.emit.apply(me, args);
                });
              }
              else {
                result.forEach(function (handler) {
                  me.emit(event, _handlers, handler);
                });
              }
            }
          }
        }
        // ... just call `super.off`
        else {
          result = fn.apply(me, arguments);
        }

        // Return `result`
        return result;
      };
    }),

    /**
     * @inheritdoc core.task.factory#constructor
     * @fires sig/task
     */
    "task": function (promiseOrResolver, name) {
      var me = this;

      // Create task
      var task = taskFactory.call(me, promiseOrResolver, name);

      // Signal `SIG_TASK` and yield `task`
      return me.emit(SIG_TASK, task, name).yield(task);
    }
  });
});
