/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
  "./registry",
  "when/when"
], function (registry, when) {
  "use strict";

  /**
   * @class core.task.factory
   * @mixin Function
   * @static
   */

  var TASK_COUNTER = 0;

  /**
   * Creates and registers a task
   * @method constructor
   * @param {Promise|Function} promiseOrResolver The task resolver.
   * @param {String} [name=task] Task name
   * @return {Promise}
   */
  return function (promiseOrResolver, name) {
    // Get promise
    var promise = when.isPromiseLike(promiseOrResolver)
      ? when(promiseOrResolver)
      : when.promise(promiseOrResolver);

    // Create key
    var key = (name || "task") + "@" + ++TASK_COUNTER;

    // Ensure un-registration
    // Register task
    // Return
    return registry.register(key, promise.ensure(function () {
      registry.unregister(key);
    }));
  };
});
