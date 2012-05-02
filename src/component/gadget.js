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

	return Component.extend(function Gadget() {
		var self = this;

		Compose.call(self, {
			initialize : topdown(self.initialize),
			finalize : topdown(self.finalize),
			state : function state(state, deferred) {
				var _self = this;
				var __proto__ = self;
				var callback;
				var callbacks = [];
				var i;
				var iMax = 0;

				add: while (__proto__ = __proto__.__proto__) {
					if (STATE in __proto__) {
						callback = __proto__[STATE];

						i = iMax;

						while (i--)
							if (callback === callbacks[i]) {
								continue add;
							}

						callbacks[iMax++] = callback;
					}
				}

				if (iMax !== 0) {
					i = iMax;

					while (--i) {
						callbacks[i] = Deferred(function (dfd) {
							var callback = callbacks[i];
							var _deferred = callbacks[i + 1] || deferred;

							dfd.done(function done() {
								callback.call(_self, state, _deferred);
							});
						});
					}

					callbacks[0].call(_self, state, callbacks[1] || deferred);
				}
				else if (deferred) {
					deferred.resolve();
				}

				return _self;
			}
		});
	});
});
