/*globals buster:false*/
buster.testCase("troopjs-core/component/registry", function(run) {
	"use strict";

	var assert = buster.referee.assert;

	require(["troopjs-core/component/emitter", "troopjs-core/component/registry", "when"],
		function(Component, registry, when) {
		var Foo = Component.extend({
			displayName: 'component/foo'
		});

		run({
			"test component registry": {
				"setUp": function() {
					var services = this.services = [Foo(), Foo()];
					return when.all(services.map(function(each) {
						return each.start();
					}));
				},

				"can query the registry": function() {
					var services = registry.access(/component\/foo/);
					assert.equals(services, this.services, "component queried from registry did not match");
				}
			}
		});
	});
});
