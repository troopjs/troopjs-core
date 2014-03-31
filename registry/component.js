/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"../mixin/base",
	"poly/array"
], function RegistryModule(Base) {
	"use strict";

	/**
	 * A light weight implementation to register key/value pairs by key and index
	 * @class core.registry.component
	 * @extends core.mixin.base
	 */

	var UNDEFINED;
	var LENGTH = "length";
	var INDEX = "index";
	var KEY = "key";
	var VALUE = "value";
	var STORAGE = "storage";
	var OBJECT_TOSTRING = Object.prototype.toString;
	var TOSTRING_STRING = "[object String]";

	/**
	 * @method constructor
	 * @inheritdoc
	 */
	return Base.extend(function Registry() {
		/**
		 * Registry storage
		 * @private
		 * @readonly
		 * @property {Object[]} storage
		 * @property {String} storage.key Entry key
		 * @property {Number} storage.index Entry index
		 * @property {*} storage.value Entry value
		 */
		this[STORAGE] = [];
	}, {
		"displayName": "core/registry/component",

		/**
		 * Either gets or puts values into the registry.
		 *
		 * - If no key is provided, all entries in the registry are returned.
		 * - If no value is provided the current value for key is returned.
		 * - If value is provided it replaces the current value for the key
		 * @param {String|Number} [key] Entry key or index
		 * @param {*} [value] Entry value
		 * @return {*} All values if no key, current value for key if no value provided, otherwise the provided value if a new entry is created
		 * @throws Error if a new entry is created and key is not of type String
		 */
		"access": function access(key, value) {
			var storage = this[STORAGE];
			var result;
			var argc;

			// Reading _all_
			if ((argc = arguments[LENGTH]) === 0) {
				result = storage.map(function (item) {
					return item[VALUE];
				});
			}
			// Reading
			else if (argc === 1) {
				result = (result = storage[key]) !== UNDEFINED
					? result[VALUE]
					: UNDEFINED;
			}
			// Writing
			else {
				// Replace existing entry
				if ((result = storage[key]) !== UNDEFINED) {
					result = result[VALUE] = value;
				}
				// Check type of key (as now we're creating a new one)
				else if (OBJECT_TOSTRING.call(key) !== TOSTRING_STRING) {
					throw Error("key has to be of type String");
				}
				// Create new entry
				else {
					result = {};
					result = storage[result[KEY] = key] = storage[result[INDEX] = storage[LENGTH]] = result;
					result = result[VALUE] = value;
				}
			}

			return result;
		},

		/**
		 * Removes entries from the registry
		 *
		 * - If no key is provided, all entries in the registry are removed.
		 * - Otherwise only the corresponding entry for key is removed.
		 * @param {String|Number} [key] Entry key or index
		 */
		"remove": function remove(key) {
			var storage;
			var result;

			// Remove all entries
			if (arguments[LENGTH] === 0) {
				this[STORAGE] = [];
			}
			// Remove entry by key
			else if ((storage = this[STORAGE]) && (result = storage[key]) !== UNDEFINED) {
				delete storage[result[KEY]];
				delete storage[result[INDEX]];
			}
		}
	});
});