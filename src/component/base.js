/**
 * TroopJS base component
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define([ "../event/emitter", "when" ], function ComponentModule(Emitter, when) {
	/*jshint laxbreak:true */

	var NULL = null;
	var ARRAY_PROTO = Array.prototype;
	var ARRAY_UNSHIFT = ARRAY_PROTO.unshift;
	var ARRAY_SLICE = ARRAY_PROTO.slice;
	var INSTANCE_COUNT = "instanceCount";
	var LENGTH = "length";
	var FEATURES = "features";
	var CONTEXT = "context";
	var VALUE = "value";
	var PROPERTIES = "properties";
	var SIG = "sig";
	var RE_PRO = /^(\w+)(?::(\w+))?\/(.+)/;
	var COUNT = 0;

	var Component = Emitter.extend(
		/**
		 * Creates a new component
		 * @constructor
		 */
	function Component() {
		var self = this;
		var bases = self.constructor._getBases(true);
		var base;
		var i = bases[LENGTH];

		var properties = self[PROPERTIES] = {};
		var property;
		var matches;
		var key;
		var type;
		var name;

		// Iterate base chain (backwards)
		while((base = bases[--i])) {
			// Iterate keys
			for (key in base) {
				// Continue if this is not a property on base
				if (!base.hasOwnProperty(key)) {
					continue;
				}

				// Continue if we can't match
				if ((matches = RE_PRO.exec(key)) === NULL) {
					continue;
				}

				// Get type
				type = matches[1];

				// Get or create type from properties
				type = type in properties
					? properties[type]
					: properties[type] = {};

				// Get name
				name = matches[3];

				// Get or create name from type
				name = name in type
					? type[name]
					: type[name] = [];

				// Create and set property by type/name
				property = name[name[LENGTH]] = {};

				// Init property
				property[FEATURES] = matches[2];
				property[CONTEXT] = base;
				property[VALUE] = base[key];
			}
		}

		// Update instance count
		self[INSTANCE_COUNT] = COUNT++;
	}, {
		"instanceCount" : COUNT,

		"displayName" : "core/component",

		/**
		 * Signals the component
		 * @param signal {String} Signal
		 * @return {*}
		 */
		"signal" : function onSignal(signal) {
			var self = this;
			var args = ARRAY_SLICE.call(arguments);
			var signals = self[PROPERTIES][SIG][signal];
			var length = signals
				? signals[LENGTH]
				: 0;
			var index = 0;

			function next(_args) {
				// Update args
				args = _args || args;

				// Return a chained promise of next callback, or a promise resolved with args
				return length > index
					? when(signals[index++][VALUE].apply(self, args), next)
					: when.resolve(args);
			}

			try {
				// Return promise
				return next();
			}
			catch (e) {
				// Return rejected promise
				return when.reject(e);
			}
		},

		/**
		 * Start the component
		 * @return {*}
		 */
		"start" : function start() {
			var self = this;
			var _signal = self.signal;
			var args = arguments;

			// Add signal to arguments
			ARRAY_UNSHIFT.call(args, "initialize");

			return _signal.apply(self, args).then(function _start() {
				// Modify args to change signal
				args[0] = "start";

				return _signal.apply(self, args);
			});
		},

		/**
		 * Stops the component
		 * @return {*}
		 */
		"stop" : function stop() {
			var self = this;
			var _signal = self.signal;
			var args = arguments;

			// Add signal to arguments
			ARRAY_UNSHIFT.call(args, "stop");

			return _signal.apply(self, args).then(function _stop() {
				// Modify args to change signal
				args[0] = "finalize";

				return _signal.apply(self, args);
			});
		}
	});

	/**
	 * Generates string representation of this object
	 * @returns Combination displayName and instanceCount
	 */
	Component.prototype.toString = function () {
		var self = this;

		return self.displayName + "@" + self[INSTANCE_COUNT];
	};

	return Component;
});
