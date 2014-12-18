/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"./emitter",
	"../pubsub/hub",
	"../pubsub/runner",
	"when/when"
],function (Emitter, hub, runner, when) {
	"use strict";

	/**
	 * Component that provides signal and hub features.
	 *
	 * 	var one = Gadget.create({
	 * 		"hub/kick/start": function(foo) {
	 * 			// handle kick start
	 * 		},
	 *
	 * 		"hub/piss/off": function() {
	 * 			// handle piss off
	 * 		},
	 *
	 * 		"sig/task": function() {
	 * 			// handle "bar" task.
	 * 		},
	 *
	 * 		"hub/task": function() {
	 * 			// handle both "foo" and "bar".
	 * 		}
	 * 	});
	 *
	 * 	var other = Gadget.create();
	 *
	 * 	other.publish("kick/start","foo");
	 * 	other.publish("piss/off");
	 * 	other.task("foo", function() {
	 * 		// some dirty lift.
	 * 	});
	 * 	one.task("bar", function() {
	 * 		// some dirty lift.
	 * 	});
	 *
	 * @class core.component.gadget
	 * @extend core.component.emitter
	 * @localdoc Adds convenience methods and specials to interact with the hub
	 * @alias feature.component
	 */

	var UNDEFINED;
	var NULL = null;
	var ARRAY_PROTO = Array.prototype;
	var RUNNER = "runner";
	var CONTEXT = "context";
	var CALLBACK = "callback";
	var ARGS = "args";
	var NAME = "name";
	var TYPE = "type";
	var VALUE = "value";
	var HUB = "hub";
	var RE = new RegExp("^" + HUB + "/(.+)");

	/**
	 * @method constructor
	 * @inheritdoc
	 */
	return Emitter.extend({
		"displayName" : "core/component/gadget",

		/**
		 * @inheritdoc
		 * @localdoc Registers event handlers declared HUB specials
		 * @handler
		 */
		"sig/initialize" : function () {
			var me = this;

			return when.map(me.constructor.specials[HUB] || ARRAY_PROTO, function (special) {
				return me.on(special[NAME], special[VALUE]);
			});
		},

		/**
		 * @inheritdoc
		 * @localdoc Triggers memorized values on HUB specials
		 * @handler
		 */
		"sig/start" : function () {
			var me = this;
			var empty = {};
			var specials = me.constructor.specials[HUB] || ARRAY_PROTO;

			// Calculate specials
			specials = specials
				.map(function (special) {
					var memory;
					var result;

					if (special[ARGS][0] === true && (memory = hub.peek(special[TYPE], empty)) !== empty) {
						// Redefine result
						result = {};
						result[TYPE] = special[NAME];
						result[RUNNER] = runner;
						result[CONTEXT] = me;
						result[CALLBACK] = special[VALUE];
						result = [ result ].concat(memory);
					}

					return result;
				})
				.filter(function (special) {
					return special !== UNDEFINED;
				});

			return when.map(specials, function (special) {
				return me.emit.apply(me, special);
			});
		},

		/**
		 * @inheritdoc
		 * @localdoc Registers subscription on the {@link core.pubsub.hub hub} for matching callbacks
		 * @handler
		 */
		"sig/add": function (handlers, type, callback) {
			var me = this;
			var matches;
			var _callback;

			if ((matches = RE.exec(type)) !== NULL) {
				// Let `_callback` be `{}` and initialize
				_callback = {};
				_callback[CONTEXT] = me;
				_callback[CALLBACK] = callback;

				// Subscribe to the hub
				hub.subscribe(matches[1], _callback);
			}
		},

		/**
		 * @inheritdoc
		 * @localdoc Removes remote subscription from the {@link core.pubsub.hub hub} that was previously registered in {@link #handler-sig/add}
		 * @handler
		 */
		"sig/remove": function (handlers, type, callback) {
			var me = this;
			var matches;
			var _callback;

			if ((matches = RE.exec(type)) !== NULL) {
				// Let `_callback` be `{}` and initialize
				_callback = {};
				_callback[CONTEXT] = me;
				_callback[CALLBACK] = callback;

				// Unsubscribe from the hub
				hub.unsubscribe(matches[1], _callback);
			}
		}
	});
});
