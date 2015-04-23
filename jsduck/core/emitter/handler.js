/**
 * The handler interface
 * @class core.emitter.handler
 * @mixin Function
 * @interface
 * @private
 */

/**
 * @method constructor
 * @abstract
 * @param {core.emitter.composition} emitter
 * @param {String} type
 * @param {Function} callback
 * @param {*} [data]
 */

/**
 * Executes an emission
 * @method handle
 * @abstract
 * @param {*[]} args Handler arguments
 * @returns {*} Result from handler
 */

/**
 * Removes this handler from owning emitter
 * @method off
 * @abstract
 */
