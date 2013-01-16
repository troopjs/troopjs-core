buster.testCase("troopjs-core/event/emitter", function (run) {
	var assert = buster.assert;

	require( [ "troopjs-core/event/emitter", "when" ] , function (Emitter, when) {

		// a little helper to deal with async calls
		var async = function(callbacks, done) {
			var next = function(result) {
				var cb = callbacks.shift();
				if (cb) {
					cb(next);
				} else {
					done && done();
				}
			}

			next();
		};

		run({
			"on/emit" : function () {
				var arg = "TEST";
				var context = this;

				Emitter()
					.on("test", context, function onTest(topic, test) {
						assert.same(arg, test);
					})
					.emit("test", arg);
			},

			"on/emit again": function() {
				var arg = "TEST";
				var context = this;

				var emitter = Emitter();
				var count = 0;
				

				emitter.on("test", context, function(topic, test){
					count++;
				});

				async([
					function(next) {
						emitter.emit("test", arg);
						emitter.emit("test", arg);
						next();
					},
				], function() {
					assert.equals(count, 2);
				})
			},

			"on/emit again with different arg": function() {
				var emitter = Emitter();
				var context = this;
				var count = 0;
				var last;

				emitter.on("test", context, function(topic, test) {
					last = test;
				});

				async([
					function(next) {
						emitter.emit("test", "test");
						emitter.emit("test", "test2");
						next();
					},
				], function() {
					assert.same(last, "test2")
				});				
			},

			"on/emit 2 emitters": function() {
				var emitter1 = Emitter();
				var emitter2 = Emitter();

				var context = this;

				emitter1.on("one", context, function(topic, arg) {
					assert.same(arg, "one");
				});
				emitter2.on("two", context, function(topic, arg){
					assert.same(arg, 2);
				});

				emitter1.emit("one", "one");
				emitter2.emit("two", 2);
			},

			"off/emit": function() {
				var emitter = Emitter();
				var context = this;
				var last;
				var callback = function(topic, arg) {
					last = arg;
				};

				emitter.on("test", context, callback);
			
				async([
					function(next) {
						emitter.emit("test", "test");
						emitter.off("test", context, callback);
						emitter.emit("test", "test2");
						next();
					}
				], function() {
					assert.equals(last, "test");
				});
			},

			"on/reemit": function() {
				var emitter = Emitter();
				var context = this;
				var count = 0;

				emitter.on("test", context, function(topic, message){
					assert.equals(message, "test");
					last = message;
					count++;
				});

				async([
					function(next) {
						emitter.emit("test", "test");
						emitter.reemit("test", context, function(topic, message) {
							assert.equals(message, "test");
							count++;
						});
					}
				], function() {
					assert.equals(count, 2);
				});
			}
		});
	});
});