/*globals buster:false*/
buster.testCase("troopjs-core/component/gizmo", function (run) {
	"use strict";

	var assert = buster.referee.assert;
	var refute = buster.referee.refute;

	require( [ "troopjs-core/component/gizmo", "when" ] , function (Gizmo, when) {

		run({
			"default instance": {
				"one handler": function () {
					var spy = this.spy();

					var gizmo = Gizmo
						.create({
							"use/troopjs-core/component/gizmo(event1)": spy
						});

					return gizmo
						.start()
						.then(function () {
							return gizmo.use("troopjs-core/component/gizmo");
						})
						.spread(function (g) {
							return g.emit("event1");
						})
						.then(function () {
							assert.calledOnce(spy);
						})
						.then(function () {
							return gizmo.stop();
						});
				},

				"multiple handlers": function () {
					var spy = this.spy();

					var gizmo = Gizmo
						.create({
							"use/troopjs-core/component/gizmo(event1)": spy,
							"use/troopjs-core/component/gizmo(event2)": spy
						});

					return gizmo
						.start()
						.then(function () {
							return gizmo.use("troopjs-core/component/gizmo");
						})
						.spread(function (g) {
							return when.join(g.emit("event1"), g.emit("event2"));
						})
						.then(function () {
							assert.calledTwice(spy);
						})
						.then(function () {
							return gizmo.stop();
						});
				}
			},
			"named instance": {
				"one handler": function () {
					var spy1 = this.spy();
					var spy2 = this.spy();

					var gizmo = Gizmo
						.create({
							"use/troopjs-core/component/gizmo@1(event1)": spy1,
							"use/troopjs-core/component/gizmo@2(event1)": spy2
						});

					return gizmo
						.start()
						.then(function () {
							return gizmo.use("troopjs-core/component/gizmo@1");
						})
						.spread(function (g) {
							return g.emit("event1");
						})
						.then(function () {
							assert.calledOnce(spy1);
							refute.called(spy2);
						})
						.then(function () {
							return gizmo.use("troopjs-core/component/gizmo@2");
						})
						.spread(function (g) {
							return g.emit("event1");
						})
						.then(function () {
							assert.calledOnce(spy1);
							assert.calledOnce(spy2);
						})
						.then(function () {
							return gizmo.stop();
						});
				},

				"multiple handlers": function () {
					var spy1 = this.spy();
					var spy2 = this.spy();

					var gizmo = Gizmo
						.create({
							"use/troopjs-core/component/gizmo@1(event1)": spy1,
							"use/troopjs-core/component/gizmo@1(event2)": spy1,
							"use/troopjs-core/component/gizmo@2(event1)": spy2,
							"use/troopjs-core/component/gizmo@2(event2)": spy2
						});

					return gizmo
						.start()
						.then(function () {
							return gizmo.use("troopjs-core/component/gizmo@1");
						})
						.spread(function (g) {
							return when.join(g.emit("event1"), g.emit("event2"));
						})
						.then(function () {
							assert.calledTwice(spy1);
							refute.called(spy2);
						})
						.then(function () {
							return gizmo.use("troopjs-core/component/gizmo@2");
						})
						.spread(function (g) {
							return when.join(g.emit("event1"), g.emit("event2"));
						})
						.then(function () {
							assert.calledTwice(spy1);
							assert.calledTwice(spy2);
						})
						.then(function () {
							return gizmo.stop();
						});
				}
			}
		});
	});
});
