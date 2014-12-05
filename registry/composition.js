/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"../composition",
	"poly/array"
], function (Composition) {
	"use strict";

	/**
	 * A light weight implementation to register key/value pairs by key and index
	 * @class core.registry.composition
	 * @extend core.composition
	 */

	var UNDEFINED;
	var LENGTH = "length";
	var INDEX = "index";
	var KEY = "key";
	var VALUE = "value";
	var INDEX_KEY = "index_key";
	var INDEX_POS = "index_pos";
	var OBJECT_TOSTRING = Object.prototype.toString;
	var TOSTRING_STRING = "[object String]";
	var REGEXP_STRING = "[object RegExp]";

	/**
	 * @method constructor
	 * @inheritdoc
	 */
	return Composition.extend(function () {
		/**
		 * Registry key storage
		 * @private
		 * @readonly
		 * @property {Object[]} index_key
		 * @property {String} index_key.key Entry key
		 * @property {Number} index_key.index Entry index
		 * @property {*} index_key.value Entry value
		 */
		this[INDEX_KEY] = {};

		/**
		 * Registry pos storage
		 * @private
		 * @readonly
		 * @property {Object[]} index_pos
		 * @property {String} index_pos.key Entry key
		 * @property {Number} index_pos.index Entry index
		 * @property {*} index_pos.value Entry value
		 */
		this[INDEX_POS] = [];
	}, {
		"displayName": "core/registry/component",

		/**
		 * Either gets or puts values into the registry.
		 *
		 * - If no key is provided, all entries in the registry are returned.
		 * - If no value is provided, it depends on the **key**
		 *   - if key is string or number, current value under this key is returned.
		 *   - if key is regexp, all values whose key match this pattern are returned
		 * - If value is provided it replaces the current value for the key
		 * @param {String|Number|RegExp} [key] Entry key, index or pattern
		 * @param {*} [value] Entry value
		 * @return {*} All values if no key, current value for key if no value provided, otherwise the provided value if a new entry is created
		 * @throws Error if a new entry is created and key is not of type String
		 */
		"access": function (key, value) {
			var index_key = this[INDEX_KEY];
			var index_pos = this[INDEX_POS];
			var result;
			var argc;

			// Reading _all_
			if ((argc = arguments[LENGTH]) === 0) {
				result = index_pos.map(function (item) {
					return item[VALUE];
				});
			}
			// query registry by keys
			else if (OBJECT_TOSTRING.call(key) === REGEXP_STRING && value === UNDEFINED){
				result = Object.keys(index_key).filter(function (name) {
						return key.test(name);
				}).map(function map(key) {
					return index_key[key][VALUE];
				});
			}
			else {
				result = (typeof key === 'number' ? index_pos : index_key)[key];

				// Reading
				if (argc === 1) {
					result = result !== UNDEFINED ? result[VALUE] : UNDEFINED;
				}
				// Writing
				else {
					// Replace existing entry
					if (result !== UNDEFINED) {
						result = result[VALUE] = value;
					}
					// Check type of key (as now we're creating a new one)
					else if (OBJECT_TOSTRING.call(key) !== TOSTRING_STRING) {
						throw Error("key has to be of type String");
					}
					// Create new entry
					else {
						result = {};
						result = index_key[result[KEY] = key] = index_pos[result[INDEX] = index_pos[LENGTH]] = result;
						result = result[VALUE] = value;
					}
				}
			}

			return result;
		},

		/**
		 * Removes entries from the registry
		 * TODO: Fixed screwed up index when item is removed from registry.
		 *
		 * - If no key is provided, all entries in the registry are removed.
		 * - Otherwise only the corresponding entry for key is removed.
		 * @param {String|Number} [key] Entry key or index
		 *
		 */
		"remove": function (key) {
			var me = this;
			var result;
			var index_key = me[INDEX_KEY];
			var index_pos = me[INDEX_POS];

			// Remove all entries
			if (arguments[LENGTH] === 0) {
				me[INDEX_KEY] = {};
				me[INDEX_POS] = [];
			}
			// Remove entry by key
			else if ((result = index_key[key]) !== UNDEFINED) {
				delete index_key[result[KEY]];
				delete index_pos[result[INDEX]];
			}
		},

		"compact": function () {

		}
	});
});
