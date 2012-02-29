/*!
 * TroopJS store/base module
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "compose", "../component/gadget" ], function StoreModule(Compose, Gadget) {
	var SLICE = Array.prototype.slice;

	function StoreProxy(target) {
		return function storeProxy() {
			return target.apply(this, SLICE.call(arguments, 1));
		};
	}

	return Gadget.extend(function Store() {
		var self = this;

		var displayName = self.displayName;

		self
			.subscribe("hub/" + displayName + "/get", self, StoreProxy(self.get))
			.subscribe("hub/" + displayName + "/set", self, StoreProxy(self.set))
			.subscribe("hub/" + displayName + "/remove", self, StoreProxy(self.remove))
			.subscribe("hub/" + displayName + "/clear", self, StoreProxy(self.clear));
	}, {
		set : Compose.required,
		get : Compose.required,
		remove : Compose.required,
		clear : Compose.required
	});
});