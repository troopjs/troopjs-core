/**
 * TroopJS core/component/base
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define([ "../event/emitter", "when" ], function ComponentModule(Emitter, when) {
	/*jshint laxbreak:true */

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
	var RE_PRO = /^(\w+)(?::([^\/]+))?\/(.+)/;
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
		var _properties;
		var _type;
		var _name;

		// Iterate base chain (backwards)
		while((base = bases[--i])) {
			// Do we already have cached properties?
			if (base.hasOwnProperty(PROPERTIES)) {
				// Get properties
				_properties = base[PROPERTIES];

				// Iterate types in _properties
				for (_type in _properties) {
					// Get or create _type in properties
					type = _type in properties
						? properties[_type]
						: properties[_type] = {};

					// Get _type from _properties
					_type = _properties[_type];

					// Iterate names in _type
					for (_name in _type) {
						// type[_name] = merge or clone _type[_name]
						type[_name] = _name in type
							? type[_name].concat(_type[_name])
							: _type[_name].slice(0);
					}
				}
				continue;
			}

			// Create _properties
			_properties = base[PROPERTIES] = {};

			// Iterate keys
			for (key in base) {
				// Continue if this is not a property on base
				if (!base.hasOwnProperty(key)) {
					continue;
				}

				// Continue if we can't match
				if ((matches = RE_PRO.exec(key)) === null) {
					continue;
				}

				// Get type
				type = _type = matches[1];

				// Get or create type from properties
				type = type in properties
					? properties[type]
					: properties[type] = {};

				// Get or create type from properties
				_type = _type in _properties
					? _properties[_type]
					: _properties[_type] = {};

				// Get name
				name = _name = matches[3];

				// Get or create name from type
				name = name in type
					? type[name]
					: type[name] = [];

				// Get or create name from type
				_name = _name in _type
					? _type[_name]
					: _type[_name] = [];

				// Create and set property by type/name
				property = _name[_name[LENGTH]] = name[name[LENGTH]] = {};

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
	 * @returns {string} displayName and instanceCount
	 */
	Component.prototype.toString = function () {
		var self = this;

		return self.displayName + "@" + self[INSTANCE_COUNT];
	};

	return Component;
});
