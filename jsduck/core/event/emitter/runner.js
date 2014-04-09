/**
 * The runner interface
 * @class core.event.emitter.runner
 * @mixin Function
 * @interface
 * @protected
 */

/**
 * Run event handlers.
 * @method constructor
 * @abstract
 * @param {Object} event Event object
 * @param {String} event.context Event context
 * @param {Function} event.callback Event callback
 * @param {Object} handlers List of handlers
 * @param {Array} args Initial arguments
 */