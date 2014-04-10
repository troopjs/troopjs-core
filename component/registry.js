/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"../registry/component",
	"../pubsub/hub"
], function ComponentRegistryModule(Registry, hub) {
	"use strict";

	/**
	 * @class core.component.registry
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

	return Registry.create(function ComponentRegistry() {
		var me = this;

		// Register the hub
		me.access(hub.toString(), hub);

		// Register ourselves
		me.access(me.toString(), me);
	}, {
		"displayName": "core/component/registry"
	});
});