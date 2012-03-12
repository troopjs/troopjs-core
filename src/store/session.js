/*!
 * TroopJS store/session module
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "compose", "./base", "json" ], function StoreSessionModule(Compose, Store, json) {

	// Grab session storage
	var STORAGE = window.sessionStorage;

	return Compose.create(Store, {
		displayName : "store/session",

		set : function set(key, value, deferred) {
			// JSON encoded 'value' then store as 'key'
			STORAGE.setItem(key, json.stringify(value));

			// Resolve deferred
			if (deferred && deferred.resolve instanceof Function) {
				deferred.resolve(value);
			}
		},

		get : function get(key, deferred) {
			// Get value from 'key', parse JSON
			var value = json.parse(STORAGE.getItem(key));

			// Resolve deferred
			if (deferred && deferred.resolve instanceof Function) {
				deferred.resolve(value);
			}
		},

		remove : function remove(key, deferred) {
			// Remove key
			STORAGE.removeItem(key);

			// Resolve deferred
			if (deferred && deferred.resolve instanceof Function) {
				deferred.resolve();
			}
		},

		clear : function clear(deferred) {
			// Clear
			STORAGE.clear();

			// Resolve deferred
			if (deferred && deferred.resolve instanceof Function) {
				deferred.resolve();
			}
		}
	});
});