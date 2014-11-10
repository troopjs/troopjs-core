/*globals buster:false*/
buster.testCase("troopjs-core/component/factory", function (run) {
	"use strict";

	var assert = buster.referee.assert;
	var refute = buster.referee.refute;

	require( [ "troopjs-core/component/factory" ] , function (factory) {
		run({
			"setUp": function () {
				this.timeout = 1000;
			},

			"default instance": function () {
				var context = {};

				return factory.call(context, "troopjs-core/component/base", "troopjs-core/component/base").spread(function (a, b) {
					assert.equals(a, b);
				});
			},

			"new instance": function () {
				var context = {};

				return factory.call(context, "troopjs-core/component/base@", "troopjs-core/component/base@").spread(function (a, b) {
					refute.equals(a, b);
				});
			},

			"named instance": function () {
				var context = {};

				return factory.call(context, "troopjs-core/component/base@test", "troopjs-core/component/base@test").spread(function (a, b) {
					assert.equals(a, b);
				});
			}
		});
	});
});
