/*!
 * TroopJS store/session module
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "compose", "./base" ], function StoreSessionModule(Compose, Store) {

	return Compose.create(Store, function StoreSession() {
		this.clear();
	}, {
		displayName : "store/session",

		set : function set(key, value, deferred) {
			deferred.resolve(this.storage[key] = value);
		},

		get : function get(key, deferred) {
			deferred.resolve(this.storage[key]);
		},

		remove : function remove(key, deferred) {
			deferred.resolve(delete this.storage[key]);
		},

		clear : function clear() {
			this.storage = {};
		}
	});
});