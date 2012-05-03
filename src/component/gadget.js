/*!
 * TroopJS gadget component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/**
 * The gadget trait provides life cycle management
 */
define([ "compose", "troopjs-compose/topdown", "deferred", "./base" ], function GadgetModule(Compose, topdown, Deferred, Component) {
	var STATE = "state";

	function noState(state, deferred) {
		if (deferred) {
			deferred.resolve();
		}
	}

	return Component.extend(function Gadget() {
		var self = this;
		var __proto__ = self;
		var callback;
		var callbacks = [];
		var i;
		var iMax = 0;

		add: do {
			if (STATE in __proto__) {
				callback = __proto__[STATE];

				i = iMax;

				while (i--)
					if (callback === callbacks[i]) {
						continue add;
					}

				callbacks[iMax++] = callback;
			}
		} while (__proto__ = __proto__.__proto__);

		Compose.call(self, {
			initialize : topdown(self.initialize),
			finalize : topdown(self.finalize),
			state : iMax !== 0
				? function state(state, deferred) {
					var _self = this;
					var count = iMax;

					while (--count) {
						callbacks[count] = Deferred(function (dfd) {
							var callback = callbacks[count];
							var _deferred = callbacks[count + 1] || deferred;
	
							dfd.done(function done() {
								callback.call(_self, state, _deferred);
							});
						});
					}

					callbacks[0].call(_self, state, callbacks[1] || deferred);
				}
				: noState
		});
	});
});
