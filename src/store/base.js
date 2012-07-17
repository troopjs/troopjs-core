/*!
 * TroopJS store/base module
 * @license TroopJS Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "compose", "../component/gadget" ], function StoreModule(Compose, Gadget) {
	var STORAGE = "storage";

	return Gadget.extend({
		storage : Compose.required,

		set : function set(key, value, deferred) {
			// JSON encoded 'value' then store as 'key'
			this[STORAGE].setItem(key, JSON.stringify(value));

			// Resolve deferred
			if (deferred) {
				deferred.resolve(value);
			}
		},

		get : function get(key, deferred) {
			// Get value from 'key', parse JSON
			var value = JSON.parse(this[STORAGE].getItem(key));

			// Resolve deferred
			if (deferred) {
				deferred.resolve(value);
			}
		},

		remove : function remove(key, deferred) {
			// Remove key
			this[STORAGE].removeItem(key);

			// Resolve deferred
			if (deferred) {
				deferred.resolve();
			}
		},

		clear : function clear(deferred) {
			// Clear
			this[STORAGE].clear();

			// Resolve deferred
			if (deferred) {
				deferred.resolve();
			}
		}
	});
});