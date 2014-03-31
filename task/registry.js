/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"../registry/component",
	"../component/registry"
], function TaskRegistryModule(Registry, componentRegistry) {
	"use strict";

	/**
	 * @class core.task.registry
	 * @extend core.registry.component
	 * @singleton
	 */

	/**
	 * @method create
	 * @static
	 * @hide
	 */

	/**
	 * @method extend
	 * @static
	 * @hide
	 */

	/**
	 * @method constructor
	 * @hide
	 */

	return Registry.create(function TaskRegistry() {
		var me = this;

		// Register ourselves
		componentRegistry.access(me.toString(), me);
	}, {
		"displayName": "core/task/registry"
	});
});