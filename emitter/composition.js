/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"mu-emitter/main",
	"../composition",
	"../config",
	"./executor",
	"troopjs-compose/decorator/from",
	"when/when"
], function (Emitter, Composition, config, executor, from) {
	"use strict";

	/**
	 * This event module is heart of all TroopJS event-based whistles, from the API names it's aligned with Node's events module,
	 * while behind the regularity it's powered by a highly customizable **event executor** mechanism.
	 *
	 * @class core.emitter.composition
	 * @extend core.composition
	 */

	var EXECUTOR = config.emitter.executor;
	var HANDLERS = config.emitter.handlers;

	/**
	 * @method constructor
	 * @inheritdoc
	 */
	return Composition.extend(function () {
		this[HANDLERS] = {};
	}, (function (key, value) {
		var me = this;
		me[key] = value;
		return me;
	}).call({
		"displayName": "core/emitter/composition",

		/**
		 * Adds a listener for the specified event type.
		 * @param {String} type The event type to subscribe to.
		 * @param {Function|Object} callback The event callback to add. If callback is a function defaults from below will be used:
		 * @param {Function} callback.callback Callback method.
		 * @param {Object} [callback.scope=this] Callback scope.
		 * @param {Number} [callback.limit=0] Callback limit.
		 * @param {Function} [callback.on=undefined] Will be called once this handler is added to the handlers list.
		 * @param {core.event.handler} [callback.on.handler] The handler that was just added.
		 * @param {Object} [callback.on.handlers] The list of handlers the handler was added to.
		 * @param {Function} [callback.off=undefined] Will be called once this handler is removed from the handlers list.
		 * @param {core.event.handler} [callback.off.handler] The handler that was just removed.
		 * @param {Object} [callback.off.handlers] The list of handlers the handler was removed from.
		 * @param {*} [data] Handler data
		 */
		"on": from(Emitter),

		/**
		 * Remove callback(s) from a subscribed event type, if no callback is specified,
		 * remove all callbacks of this type.
		 * @param {String} type The event type subscribed to
		 * @param {Function|Object} [callback] The event callback to remove. If callback is a function scope will be this, otherwise:
		 * @param {Function} [callback.callback] Callback method to match.
		 * @param {Object} [callback.scope=this] Callback scope to match.
		 */
		"off": from(Emitter),

		/**
		 * Adds a listener for the specified event type exactly once.
		 * @inheritdoc #on
		 */
		"one": from(Emitter),

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
		"emit": from(Emitter)
	}, EXECUTOR, executor));
});
