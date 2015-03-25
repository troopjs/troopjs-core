define([
  "buster",
  "../../registry/emitter"
], function (buster, Registry) {
  "use strict";

  var assert = buster.referee.assert;
  var refute = buster.referee.refute;

  buster.testCase("troopjs-core/registry/emitter", {
    "when starting from scratch": {
      "returns empty array when .get() on empty registry": function () {
        assert.match(Registry().get(), []);
      },

      "returns UNDEFINED when .get(key) on empty registry": function () {
        refute.defined(Registry().get("key"));
      },

      "can store and retrieve by key": function () {
        var registry = Registry();
        var item = registry.register("key", {});

        assert.same(item, registry.get("key"));
      },

      "can store and iterate": function () {
        var registry = Registry();
        var item = registry.register("key", {});

        assert.equals([ item ], registry.get());
      },

      "can store, filter and iterate": function () {
        var registry = Registry();
        var item1 = registry.register("key1", {});
        var item3 = registry.register("key3", {});
        registry.register("2key", {});

        assert.equals([ item1, item3 ], registry.get(/^key.+/));
      },

      "can unregister by key": function () {
        var registry = Registry();

        registry.register("key", {});
        assert.defined(registry.get("key"));

        registry.unregister("key");
        refute.defined(registry.get("key"));
      }
    }
  });
});
