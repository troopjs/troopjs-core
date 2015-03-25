/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([ "../config" ], function (config) {
  "use strict";

  /**
   * @class core.component.executor
   * @mixin Function
   * @private
   * @static
   * @alias feature.executor
   */

  var UNDEFINED;
  var FALSE = false;
  var HEAD = config.emitter.head;
  var NEXT = config.emitter.next;
  var CALLBACK = config.emitter.callback;
  var SCOPE = config.emitter.scope;

  /**
   * @method constructor
   * @inheritdoc core.emitter.executor#constructor
   * @localdoc
   * - Executes event handlers synchronously passing each handler `args`.
   * - Anything returned from a handler except `undefined` will be stored as `result`
   * - If a handler returns `undefined` the current `result` will be kept
   * - If a handler returns `false` no more handlers will be executed.
   *
   * @return {*} Stored `result`
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

    // Reduce and return
    return _handlers.reduce(function (current, _handler) {
      var result = current !== FALSE
        ? _handler.handle(args)
        : current;

      return result === UNDEFINED
        ? current
        : result;
    }, UNDEFINED);
  };
});
