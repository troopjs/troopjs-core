buster.testCase("troopjs-core/component/base", function (run) {
	var assert = buster.assert;

	require( [ "troopjs-core/component/base" ] , function (Component) {
		run({
			"on/emit" : function () {
				var arg = "TEST";

				Component()
					.on("test", function onTest(topic, test) {
						assert.same(arg, test);
					})
					.emit("test", arg);
			}
		});
	});
});