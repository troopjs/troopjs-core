/*globals buster:false*/
buster.testCase("troopjs-core/registry/component", function (run) {
	"use strict";

	var assert = buster.referee.assert;
	var refute = buster.referee.refute;

	require( [ "troopjs-core/registry/component" ] , function (Registry) {
		run({
			"when starting from scratch": {
				"setUp": function () {
					this.registry = Registry();
				},

				"STORAGE is empty": function () {
					assert.match(this.registry.access(), []);
				},

				"does not iterate": function () {
					var spy = this.spy();

					this.registry.access().forEach(spy);

					refute.called(spy);
				},

				"returns UNDEFINED when calling .access with a key": function () {
					refute.defined(this.registry.access("key"));
				},

				"can store and retrieve by key": function () {
					var item = this.registry.access("key", {});

					assert.same(item, this.registry.access("key"));
				},

				"can store by key and retrieve by index": function () {
					var item = this.registry.access("key", {});

					assert.same(item, this.registry.access(0));
				},

				"can store by key and update by index": function () {
					var registry = this.registry;
					var item = registry.access("key", {});

					assert.same(item, registry.access(0));

					item = registry.access(0, {});

					assert.same(item, registry.access(0));
				},

				"can store by key and iterate": function () {
					var item = this.registry.access("key", {});
					var spy = this.spy();

					this.registry.access().forEach(spy);

					assert.calledOnceWith(spy, item, 0);
				},

				"throws if entry is created without a string key": function () {
					assert.exception(function () {
						this.registry.access(0, {});
					});
				}
			}
		});
	});
});
