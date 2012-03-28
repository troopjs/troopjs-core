/*!
 * TroopJS data/cache module
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define( [ "compose", "../component/gadget" ], function CacheModule(Compose, Gadget) {
	var UNDEFINED = undefined;
	var FALSE = false;
	var NULL = null;
	var FUNCTION = Function;
	var OBJECT = Object;
	var ARRAY = Array;

	var INTERVAL = "interval";
	var GENERATIONS = "generations";
	var HEAD = "head";
	var NEXT = "next";
	var EXPIRES = "expires";
	var CONSTRUCTOR = "constructor";
	var LENGTH = "length";
	var _ID = "id";
	var _COLLAPSED = "collapsed";
	var _MAXAGE = "maxAge";
	var _EXPIRES = "expires";
	var _INDEXED = "indexed";
	var SHIFT = 16; // Magic number to use for calculating next generation
	var MSEC = 1 << SHIFT; // Calculate 'duration' of a generation

	/**
	 * Internal method to put a node in the cache
	 * @param node Node
	 * @param constructor Constructor of value
	 * @param self Cache instance
	 * @param now Current date
	 * @returns Cached node
	 */
	function _put(node, constructor, self, now) {
		var result;
		var id = NULL;
		var i;
		var iMax;
		var expires;
		var head;
		var current;
		var next;
		var generation;
		var generations = self[GENERATIONS];
		var property = NULL;
		var value;

		cache : {
			// Can't cache if there is no id
			if (!(_ID in node)) {
				result = node;	// Reuse ref to node (avoids object creation)
				break cache;
			}

			// Get ID
			id = node[_ID];

			// In cache, get it!
			if (id in self) {
				result = self[id];
				break cache;
			}

			// Not in cache, add it!
			result = self[id] = node;	// Reuse ref to node (avoids object creation)

			// Ensure COLLAPSED property is reset
			if (!(_COLLAPSED in node)) {
				result[_COLLAPSED] = false;
			}
		}

		// Update INDEXED
		result[_INDEXED] = now;

		// Check that this is an ARRAY, index all values
		if (constructor === ARRAY) for (i = 0, iMax = node[LENGTH]; i < iMax; i++) {

			// Keep value
			value = node[i];

			// Get constructor of value (safely, falling back to UNDEFINED)
			constructor = value === NULL || value === UNDEFINED
				? UNDEFINED
				: value[CONSTRUCTOR];

			// Do magic comparison to see if we recursively put this in the cache, or plain put
			result[i] = (constructor === OBJECT || constructor === ARRAY && value[LENGTH] !== 0) && value[_INDEXED] !== now
				? _put(value, constructor, self, now)
				: value;
		}

		// Check that this is an OBJECT, index all properties
		else if (constructor === OBJECT) for (property in node) {
			// Don't overwrite the ID property
			// or the MAXAGE property
			// or the INDEXED property
			// or the COLLAPSED property, if it's false
			if (property === _ID
					|| property === _MAXAGE
					|| property === _INDEXED
					|| (property === _COLLAPSED && result[_COLLAPSED] === FALSE)) {
				continue;
			}

			// Keep value
			value = node[property];

			// Get constructor of value (safely, falling back to UNDEFINED)
			constructor = value === NULL || value === UNDEFINED
				? UNDEFINED
				: value[CONSTRUCTOR];

			// Do magic comparison to see if we recursively put this in the cache, or plain put
			result[property] = (constructor === OBJECT || constructor === ARRAY && value[LENGTH] !== 0) && value[_INDEXED] !== now
				? _put(value, constructor, self, now)
				: value;
		}

		expire : {
			// Break fast if id is NULL or there is no MAXAGE
			if (id === NULL || !(_MAXAGE in result)) {
				break expire;
			}

			remove : {
				// Fail fast if there is no old expiration
				if (!(_EXPIRES in result)) {
					break remove;
				}

				// Calculate generation expiration
				expires = result[_EXPIRES] >>> SHIFT;

				// Remove ref from generation (if that generation exists)
				if (expires in generations) {
					delete generations[expires][id];
				}
			}

			add : {
				// Update expiration time, calculate generation expiration
				expires = (result[_EXPIRES] = now + result[_MAXAGE]) >>> SHIFT;

				// Existing generation
				if (expires in generations) {
					// Add result to generation
					generations[expires][id] = result;
					break add;
				}

				// Create generation
				generation = generations[expires] = {};

				// Add result to generation
				generation[id] = result;

				// Set expiration
				generation[EXPIRES] = expires;

				// Short circuit if there is no head
				if (generations[HEAD] === UNDEFINED) {
					generations[HEAD] = generation;
					break add;
				}

				// Step through list as long as there is a next, and expiration is "older" than the next expiration
				for (head = current = generations[HEAD]; next = current[NEXT], next !== UNDEFINED && next[EXPIRES] < expires; current = next);

				// Check if we're still on the head
				if (current === head) {
					// Next generation is the current one (head)
					generation[NEXT] = current;

					// Reset head to new generation
					generations[HEAD] = generation;
					break add;
				}

				// Insert new generation between current and current.next
				generation[NEXT] = current[NEXT];
				current[NEXT] = generation;
			}
		}

		return result;
	}

	return Compose.create(Gadget, function Cache() {
		this.flush();
	}, {
		"displayName" : "data/cache",

		/**
		 * Puts a node into the cache
		 * @param node Node to add (object || array)
		 * @returns Cached node (if it existed in the cache before), otherwise the node sent in
		 */
		put : function put(node) {
			var self = this;

			// Get constructor of node (safely, falling back to UNDEFINED)
			var constructor = node === NULL || node === UNDEFINED
				? UNDEFINED
				: node[CONSTRUCTOR];

			// Do magic comparison to see if we should cache this object
			return constructor === OBJECT || constructor === ARRAY && node[LENGTH] !== 0
				? _put(node, constructor, self, new Date().getTime())
				: node;
		},

		/**
		 * Flushes cache
		 * @returns self
		 */
		flush : function flush() {
			var self = this;
			var property = NULL;
			var generations;

			// Clear sweep interval (if it exists)
			if (INTERVAL in self) {
				clearInterval(self[INTERVAL]);

				// Iterate all properties on self
				for (property in self) {
					// Don't delete functions
					if (self[property][CONSTRUCTOR] === FUNCTION) {
						continue;
					}

					// Delete from self (cache)
					delete self[property];
				}
			}

			// Create new generations
			self[GENERATIONS] = generations = {};

			// Create new sweep interval
			self[INTERVAL] = setInterval(function sweep() {
				// Calculate expiration of the previous generation
				var expires = (new Date().getTime() >>> SHIFT) - 1;
				var property = NULL;
				var current;

				// Get head
				current = generations[HEAD];

				// Fail fast if there's no head
				if (current === UNDEFINED) {
					return;
				}

				do {
					// Exit if this generation is to young
					if (current[EXPIRES] > expires) {
						break;
					}

					// Iterate all properties on current
					for (property in current) {
						// And is it not a reserved property
						if (property === EXPIRES || property === NEXT || property === GENERATIONS) {
							continue;
						}

						// Delete from self (cache)
						delete self[property];
					}

					// Delete generation
					delete generations[current[EXPIRES]];
				}
				// While there's a next
				while (current = current[NEXT]);

				// Reset head
				generations[HEAD] = current;
			}, MSEC);

			return self;
		}
	});
});
