/*globals buster:false*/
buster.testCase("troopjs-core/component/registry", function(run) {
	"use strict";

	var assert = buster.referee.assert;

	require(["troopjs-core/component/service", "troopjs-core/component/registry", "when"],
		function(Service, registry, when) {
		var FooService = Service.extend({
			displayName: 'service/foo'
		});

		run({
			"test component registry": {
				"setUp": function() {
					var services = this.services = [FooService(), FooService()];
					return when.all(services.map(function(each) {
						return each.start();
					}));
				},

				"can query the registry": function() {
					var services = registry.access(/service\/foo/);
					assert.equals(services, this.services, "services queried from registry did not match");
				}
			}
		});
	});
});
