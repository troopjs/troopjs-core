/*
 * TroopJS core/component/factory
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([ "troopjs-utils/unique", "poly/object" ], function ComponentFactoryModule(unique) {
	"use strict";

	var PROTOTYPE = "prototype";
	var TOSTRING = "toString";
	var ARRAY_PROTO = Array[PROTOTYPE];
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var ARRAY_UNSHIFT = ARRAY_PROTO.unshift;
	var OBJECT_TOSTRING = Object[PROTOTYPE][TOSTRING];
	var TYPEOF_FUNCTION = "function";
	var DISPLAYNAME = "displayName";
	var LENGTH = "length";
	var EXTEND = "extend";
	var CREATE = "create";
	var DECORATE = "decorate";
	var DECORATED = "decorated";
	var BEFORE = "before";
	var AFTER = "after";
	var AROUND = "around";
	var CONSTRUCTOR = "constructor";
	var CONSTRUCTORS = "constructors";
	var SPECIALS = "specials";
	var GROUP = "group";
	var VALUE = "value";
	var FEATURES = "features";
	var TYPE = "type";
	var NAME = "name";
	var RE_SPECIAL = /^(\w+)(?::(.+?))?\/([-_./\d\w\s]+)$/;
	var NOOP = function noop () {};
	var factoryDescriptors = {};

	/**
	 * Sub classing from this component, and to instantiate it immediately.
	 * @member core.component.factory
	 * @static
	 * @inheritdoc core.component.factory#Factory
	 * @returns {Object} Instance of this class.
	 */
	function create() {
		/*jshint validthis:true*/
		return extend.apply(this, arguments)();
	}

	/**
	 * Sub classing from this component.
	 * @member core.component.factory
	 * @static
	 * @inheritdoc core.component.factory#Factory
	 * @returns {Function} The extended subclass.
	 */
	function extend() {
		/*jshint validthis:true*/
		var args = [ this ];
		ARRAY_PUSH.apply(args, arguments);
		return Factory.apply(null, args);
	}

	/**
	 * Creates new Decorator
	 * @private
	 * @class core.component.factory.Decorator
	 * @param {Function} decorated Original function
	 * @param {Function} decorate Function to re-write descriptor
	 */
	function Decorator(decorated, decorate) {
		var descriptor = {};

		// Add DECORATED to descriptor
		descriptor[DECORATED] = {
			"value" : decorated
		};

		// Add DECORATE to descriptor
		descriptor[DECORATE] = {
			"value" : decorate
		};

		// Define properties
		Object.defineProperties(this, descriptor);
	}

	/**
	 * Create a decorator function property to override the original one from prototype, that runs before
	 * the start of the former.
	 *
	 * @member core.component.factory
	 * @static
	 * @param {Function} decorated The decorator function which receives the same arguments as with the original.
	 * @returns {core.component.factory.Decorator}
	 */
	function before(decorated) {
		return new Decorator(decorated, before[DECORATE]);
	}

	before[DECORATE] = function (descriptor) {
		var previous = this[DECORATED];
		var next = descriptor[VALUE];

		descriptor[VALUE] = next
			? function () {
			var me = this;
			var args = arguments;
			return next.apply(me, args = previous.apply(me, args) || args);
		}
			: previous;

		return descriptor;
	};

	/**
	 * Create a decorator function property to override the original one from prototype, that runs after
	 * the completion of the former.
	 *
	 * @member core.component.factory
	 * @static
	 * @param {Function} decorated The decorator function which receives the return value from the original.
	 * @returns {core.component.factory.Decorator}
	 */
	function after(decorated) {
		return new Decorator(decorated, after[DECORATE]);
	}

	after[DECORATE] = function (descriptor) {
		var previous = descriptor[VALUE];
		var next = this[DECORATED];


		descriptor[VALUE] = previous
			? function () {
				var me = this;
				var args = arguments;
				return next.apply(me, args = previous.apply(me, args) || args);
			}
			: next;

		return descriptor;
	};

	/**
	 * Create a decorator function property to override the original one from prototype, that get passed the original
	 * function, eventually reach the maximum flexibility on execution flow.
	 *
	 * @member core.component.factory
	 * @static
	 * @param {Function} decorated The decorator function which receives the original function as parameter.
	 * @returns {core.component.factory.Decorator}
	 */
	function around(decorated) {
		return new Decorator(decorated, around[DECORATE]);
	}

	/**
	 *
	 * @param {Function} descriptor
	 * @returns {Mixed}
	 */
	around[DECORATE] = function (descriptor) {
		descriptor[VALUE] = this[DECORATED](descriptor[VALUE] || NOOP);

		return descriptor;
	};

	/*
	 * Returns a string representation of this constructor
	 * @member core.component.factory
	 * @static
	 * @returns {String}
	 */
	function ConstructorToString() {
		var me = this;
		var prototype = me[PROTOTYPE];

		return DISPLAYNAME in prototype
			? prototype[DISPLAYNAME]
			: OBJECT_TOSTRING.call(me);
	}

	/**
	 * The factory module establishes the fundamental object composing in TroopJS:
	 *
	 *  - First-class prototype based **mixin**, that supports deterministic multiple inheritance that:
	 *  	- Eliminating the frustrating issues from multi-tiered, single-rooted ancestry;
	 *    - Avoid occasionally unexpected modification from prototype chain, from the prototype-based inheritance;
	 *    - Reduced the function creation overhead in classical inheritance pattern;
	 *  - **Advice decorator** for method overriding without the need for super call;
	 *  - **Declarative** "special" functions preserved for sending messages to object, that never overrides parent ones.
	 *
	 * Basically Factory takes objects or constructors as arguments and returns a new constructor, the arguments are
	 * composed from left to right, later arguments taken precedence (overriding) former arguments,
	 * and any functions be executed on construction from left to right.
	 *
	 *  		// Define the constructor.
	 *  		var MyClass = Factory(function() {
	 *  			// initialize the object...
	 *  			this.baz = "quz";
	 *  		},
	 *  		{
	 *  			foo: "bar",
	 *  			do: function(){
	 *  				return "work";
	 *  			},
	 *
	 *  			// a special handler for "signal" type with value "foo".
	 *  			"signal/foo": function() {}
	 *
	 *  		});
	 *
	 *  		var MyBehavior =  Factory({
	 *  			somethingElse: function(){}
	 *  		});
	 *
	 *  		// SubClass extends from MyClass and mixin MyBehavior
	 *  		var SubClass = MyClass.extend(function() {
	 *  			// initialize the object...
	 *  		},
	 *
	 *  		MyBehavior,
	 *  		{
	 *  			// Overwrite parent.
	 *  			foo: "baz",
	 *
	 *  			// Override parent with after call.
	 *  			do: Factory.after(function(retval) {
	 *  				return retval + "," + "play";
	 *  			}),
	 *
	 *  			move: function(){}
	 *  		});
	 *
	 *  		// Instantiate the subClass.
	 *  		var instance = SubClass.create({
	 *  			evenMore: function(){}
	 *  		});
	 *
	 *  		// "baz"
	 *  		instance.foo;
	 *
	 *  		// "quz"
	 *  		instance.baz;
	 *
	 *  		// "work play"
	 *  		instance.do();
	 *
	 *  		instance.somethingElse();
	 *  		instance.evenMore();
	 *
	 * @class core.component.factory
	 */

	/**
	 * The class composer function.
	 * @member core.component.factory
	 * @method Factory
	 * @constructor
	 * @param {Function...} constructor(s) One or more function(s) to be called upon.
	 * @param {Object} spec The object specification that describes properties.
	 * @returns {Function} The constructor(class).
	 */
	function Factory () {
		var special;
		var specials = [];
		var specialsLength;
		var arg;
		var args = arguments;
		var argsLength = args[LENGTH];
		var constructors = [];
		var constructorsLength;
		var name;
		var names;
		var namesLength;
		var i;
		var j;
		var group;
		var type;
		var matches;
		var value;
		var descriptor;
		var prototype = {};
		var prototypeDescriptors = {};
		var constructorDescriptors = {};

		// Iterate arguments
		for (i = 0; i < argsLength; i++) {
			// Get arg
			arg = args[i];

			// If this is a function we're going to add it as a constructor candidate
			if(typeof arg === TYPEOF_FUNCTION) {
				// If this is a synthetic constructor then add (child) constructors
				if (CONSTRUCTORS in arg) {
					ARRAY_PUSH.apply(constructors, arg[CONSTRUCTORS]);
				}
				// Otherwise add as usual
				else {
					ARRAY_PUSH.call(constructors, arg);
				}

				// If we have SPECIALS then unshift arg[SPECIALS] onto specials
				if (SPECIALS in arg) {
					ARRAY_UNSHIFT.apply(specials, arg[SPECIALS]);
				}

				// Continue if this is a dead cause
				if (arg === arg[PROTOTYPE][CONSTRUCTOR]) {
					continue;
				}

				// Arg is now arg prototype
				arg = arg[PROTOTYPE];
			}

			// Get arg names
			names = Object.getOwnPropertyNames(arg);

			// Iterate names
			for (j = 0, namesLength = names[LENGTH]; j < namesLength; j++) {
				// Get name
				name = names[j];

				// Check if this matches a SPECIAL signature
				if ((matches = RE_SPECIAL.exec(name))) {
					// Create special
					special = {};

					// Set special properties
					special[GROUP] = group = matches[1];
					special[FEATURES] = matches[2];
					special[TYPE] = type = matches[3];
					special[NAME] = group + "/" + type;
					special[VALUE] = arg[name];

					// Unshift special onto specials
					ARRAY_UNSHIFT.call(specials, special);
				}
				// Otherwise just add to prototypeDescriptors
				else {
					// Get descriptor for arg
					descriptor = Object.getOwnPropertyDescriptor(arg, name);

					// Get value
					value = descriptor[VALUE];

					// If value is instanceof Advice, we should re-describe, otherwise just use the original desciptor
					prototypeDescriptors[name] = value instanceof Decorator
						? value[DECORATE](prototypeDescriptors[name] || {
							"enumerable" : true,
							"configurable" : true,
							"writable" : true
						})
						: descriptor;
				}
			}
		}

		// Define properties on prototype
		Object.defineProperties(prototype, prototypeDescriptors);

		// Reduce constructors to unique values
		constructorsLength = unique.call(constructors);

		// Reduce specials to unique values
		specialsLength = unique.call(specials);

		// Iterate specials
		for (i = 0; i < specialsLength; i++) {
			// Get special
			special = specials[i];

			// Get special properties
			group = special[GROUP];
			type = special[TYPE];
			name = special[NAME];

			// Get or create group object
			group = group in specials
				? specials[group]
				: specials[group] = [];

			// Get or create type object
			type = type in group
				? group[type]
				: group[type] = specials[name] = [];

			// Store special in group/type
			group[group[LENGTH]] = type[type[LENGTH]] = special;
		}

		/*
		 * Component constructor
		 * @returns {Constructor} Constructor
		 */
		function Constructor () {
			// Allow to be created either via 'new' or direct invocation
			var instance = this instanceof Constructor
				? this
				: Object.create(prototype);

			var _args = arguments;
			var _i;

			// Set the constructor on instance
			Object.defineProperty(instance, CONSTRUCTOR, {
				"value" : Constructor
			});

			// Iterate constructors
			for (_i = 0; _i < constructorsLength; _i++) {
				// Capture result as _args to pass to next constructor
				_args = constructors[_i].apply(instance, _args) || _args;
			}

			return instance;
		}

		// Add PROTOTYPE to constructorDescriptors
		constructorDescriptors[PROTOTYPE] = {
			"value" : prototype
		};

		// Add CONSTRUCTORS to constructorDescriptors
		constructorDescriptors[CONSTRUCTORS] = {
			"value" : constructors
		};

		// Add SPECIALS to constructorDescriptors
		constructorDescriptors[SPECIALS] = {
			"value" : specials
		};

		constructorDescriptors[TOSTRING] = {
			"value" : ConstructorToString
		};

		// Add EXTEND to constructorDescriptors
		constructorDescriptors[EXTEND] = {
			"value" : extend
		};

		// Add CREATE to constructorDescriptors
		constructorDescriptors[CREATE] = {
			"value" : create
		};

		// Define prototypeDescriptors on Constructor
		Object.defineProperties(Constructor, constructorDescriptors);

		// Return Constructor
		return Constructor;
	}

	// Add CREATE to factoryDescriptors
	factoryDescriptors[CREATE] = {
		"value" : function FactoryCreate() {
			return Factory.apply(null, arguments)();
		}
	};

	// Add BEFORE to factoryDescriptors
	factoryDescriptors[BEFORE] = {
		"value" : before
	};

	// Add AFTER to factoryDescriptors
	factoryDescriptors[AFTER] = {
		"value" : after
	};

	// Add AROUND to factoryDescriptors
	factoryDescriptors[AROUND] = {
		"value" : around
	};

	// Define factoryDescriptors on Factory
	Object.defineProperties(Factory, factoryDescriptors);

	// Return Factory
	return Factory;
});