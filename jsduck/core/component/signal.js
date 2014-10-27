/**
 * The signal interface
 * @class core.component.signal
 * @mixin Function
 * @interface
 * @protected
 */

/**
 * Emits a signal ensuring signal dependencies are met
 * @method constructor
 * @abstract
 * @param {...*} [args] Signal arguments
 * @returns {Promise} Promise resolving to the signal result
 */