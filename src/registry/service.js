/**
 * TroopJS core/registry/service
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define([ "../component/service", "poly/object", "poly/array" ], function RegistryServiceModule(Service) {
	var SERVICES = "services";

	function add(service) {
		this[SERVICES][service.toString()] = service;
	}

	return Service.extend(function RegistryService() {
		this[SERVICES] = {};
	},{
		"displayName" : "core/registry/service",

		"sig/initialize" : function onInitialize() {
			return add.call(this, this);
		},

		"hub/registry/add" : function onAdd(topic, service) {
			return add.call(this, service);
		},

		"hub/registry/remove" : function onRemove(topic, service) {
			delete this[SERVICES][service.toString()];
		},

		"hub/registry/get" : function onGet(topic, name) {
			var re = new RegExp(name);
			var services = this[SERVICES];

			return Object.keys(services)
				.filter(function filter(serviceName) {
					return re.test(serviceName);
				})
				.map(function map(serviceName) {
					return services[serviceName];
				});
		}
	});
});