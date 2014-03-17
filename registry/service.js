/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"../component/service",
	"poly/object",
	"poly/array"
], function RegistryServiceModule(Service) {
	"use strict";

	/**
	 * A special {@link core.component.service service} presents the registry table for all
	 * other services across the application.
	 *
	 * 	// Upon instantiation this service is registered.
	 * 	Service.create({
	 *
	 * 		// This will be the service key.
	 * 		displayName: "my/provided",
	 *
	 * 		// Provide actual services on hub.
	 * 		"hub/my/provided/service" : function() {
	 * 			// Do some dirty lift.
	 * 		}
	 * 	});
	 *
	 * 	// Now we can look for it in registry.
	 * 	var service = registry.get("my/provided")[0];
	 *
	 * @class core.registry.service
	 * @extends core.component.service
	 */

	var SERVICES = "services";

	/**
	 * @method constructor
	 */
	return Service.extend(function RegistryService() {
		var me = this;

		/**
		 * Registred services
		 * @private
		 * @readonly
		 * @property {core.component.service[]} services
		 */
		me[SERVICES] = {};

		me.add(me);
	},{
		"displayName" : "core/registry/service",

		/**
		 * Register a service.
		 * @chainable
		 * @param {core.component.service} service
		 */
		"add" : function add(service) {
			var me = this;

			me[SERVICES][service.toString()] = service;

			return me;
		},

		/**
		 * Remove a service from the registry.
		 * @chainable
		 * @param {core.component.service} service
		 */
		"remove": function remove(service) {
			var me = this;

			delete me[SERVICES][service.toString()];

			return me;
		},

		/**
		 * Find registered service(s) by service name.
		 * @param {String} pattern Regexp that matches the service name.
		 * @returns {Array|null}
		 */
		"get" : function get(pattern) {
			var re = new RegExp(pattern);
			var services = this[SERVICES];

			return Object.keys(services)
				.filter(function filter(serviceName) {
					return re.test(serviceName);
				})
				.map(function map(serviceName) {
					return services[serviceName];
				});
		},

		/**
		 * Hub event for adding service.
		 * @handler
		 * @param {core.component.service} service
		 */
		"hub/registry/add" : function onAdd(service) {
			this.add(service);
		},

		/**
		 * Hub event for removing service.
		 * @handler
		 * @param {core.component.service} service
		 */
		"hub/registry/remove" : function onRemove(service) {
			this.remove(service);
		},

		/**
		 * Hub event for finding service(s).
		 * @handler
		 * @param {String} pattern
		 * @returns {core.component.service[]}
		 */
		"hub/registry/get" : function onGet(pattern) {
			return this.get(pattern);
		}
	});
});
