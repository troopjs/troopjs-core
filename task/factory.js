/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"./registry",
	"when"
], function (registry, when) {
	"use strict";

	/**
	 * @class core.task.factory
	 * @mixin Function
	 * @static
	 */

	var NAME = "name";
	var CONTEXT = "context";
	var STARTED = "started";
	var FINISHED = "finished";

	/**
	 * Creates and registers a task
	 * @method constructor
	 * @param {Promise|Resolver} promiseOrResolver The task resolver.
	 * @param {String} [name] Task name
	 * @return {Promise}
	 */
	return function factory(promiseOrResolver, name) {
		var task = when.isPromiseLike(promiseOrResolver)
			? when(promiseOrResolver)
			: when.promise(promiseOrResolver);

		task[CONTEXT] = this;
		task[NAME] = name || "task";
		task[STARTED] = new Date();

		// Compute task `key`
		var key = task[NAME] + "@" + task[STARTED];

		// Register task
		registry.access(key, task);

		return task
			// Cleanup
			.ensure(function () {
				// Let `task[FINISHED]` be `new Date()`
				task[FINISHED] = new Date();

				// Un-register task
				registry.remove(key)
			});
	};
});