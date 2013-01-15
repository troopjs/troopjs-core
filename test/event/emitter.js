buster.testCase("troopjs-core/event/emitter", function (run) {
	var assert = buster.assert;

	require( [ "troopjs-core/event/emitter" ] , function (Emitter) {
		run({
			"on/emit" : function () {
				var arg = "TEST";
				var context = this;

				Emitter()
					.on("test", context, function onTest(topic, test) {
						assert.same(arg, test);
					})
					.emit("test", arg);
			}
		});
	});
});