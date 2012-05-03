/*!
 * TroopJS gadget component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/**
 * The gadget trait provides life cycle management
 */
define([ "compose", "deferred", "./base" ], function GadgetModule(Compose, Deferred, Component) {
	var STATE = "state";
	var INITIALIZE = "initialize";
	var FINALIZE = "finalize";

	return Component.extend(function Gadget() {
		var self = this;
		var __proto__ = self;
		var callback;
		var sCallbacks = [];
		var iCallbacks = [];
		var fCallbacks = [];
		var sCount = 0;
		var iCount = 0;
		var fCount = 0;
		var i;

		do {
			add: if (__proto__.hasOwnProperty(INITIALIZE)) {
				callback = __proto__[INITIALIZE];

				i = iCount;

				while (i--) {
					if (callback === iCallbacks[i]) {
						break add;
					}
				}

				iCallbacks[iCount++] = callback;
			}

			add: if (__proto__.hasOwnProperty(FINALIZE)) {
				callback = __proto__[FINALIZE];

				i = fCount;

				while (i--) {
					if (callback === fCallbacks[i]) {
						break add;
					}
				}

				fCallbacks[fCount++] = callback;
			}

			add: if (__proto__.hasOwnProperty(STATE)) {
				callback = __proto__[STATE];

				i = sCount;

				while (i--) {
					if (callback === sCallbacks[i]) {
						break add;
					}
				}

				sCallbacks[sCount++] = callback;
			}
		} while (__proto__ = __proto__.__proto__);

		Compose.call(self, {
			initialize : iCount <= 1
				? self[INITIALIZE]
				: function initialize() {
					var _self = this;
					var count = -1;
					var length = iCount;

					while (++count < length) {
						iCallbacks[count].apply(_self, arguments);
					}

					return _self;
				},

			finalize : fCount <= 1
				? self[FINALIZE]
				: function finalize() {
					var _self = this;
					var count = -1;
					var length = fCount;

					while (++count < length) {
						fCallbacks[count].apply(_self, arguments);
					}

					return _self;
				},

			state : sCount <= 1
				? self[STATE]
				: function state(state, deferred) {
					var _self = this;
					var count = sCount;
					var callbacks = [];

					while (--count) {
						callbacks[count] = Deferred(function (dfd) {
							var callback = sCallbacks[count];
							var _deferred = sCallbacks[count + 1] || deferred;
	
							dfd.done(function done() {
								callback.call(_self, state, _deferred);
							});
						});
					}

					sCallbacks[0].call(_self, state, callbacks[1] || deferred);

					return _self;
				}
		});
	}, {
		displayName : "component/gadget",

		state : function state(state, deferred) {
			if (deferred) {
				deferred.resolve();
			}
		}
	});
});
