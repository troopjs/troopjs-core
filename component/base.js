/*
 * TroopJS core/component/base
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([
	"../event/emitter",
	"when",
	"troopjs-utils/merge",
	"poly/array"
], function ComponentModule(Emitter, when, merge) {
	"use strict";

	/**
	 * Imagine component as an object that has predefined life-cycle, with the following phases:
	 *
	 *   1. initialize (signal)
	 *   1. start (signal)
	 *   1. started
	 *   1. stop (signal)
	 *   1. finalize (signal)
	 *   1. finalized
	 *
	 * Calls on {@link #start} or {@link #stop} method of the component will trigger any defined signal
	 * handlers declared.
	 *
	 * 	var app = Component.extend({
	 * 		"displayName": "my/component/app",
	 *
	 * 		// Signal handler for "start" phase
	 * 		"sig/start": function start() {
	 * 			// bind resize handler.
	 * 			$(window).on('resize.app', $.proxy(this.onResize, this));
	 * 		},
	 *
	 * 		// Signal handler for "finalize" phase
	 * 		"sig/finalize": function finalize() {
	 * 			// cleanup the handler.
	 * 			$(window).off('resize.app');
	 * 		},
	 *
	 * 		"onResize": function onResize(argument) {
	 * 			// window resized.
	 * 		}
	 * 	});
	 *
	 * 	$.ready(function on_load() {
	 * 		app.start();
	 * 	});
	 *
	 * 	$(window).unload(function on_unload (argument) {\
	 * 	  app.end();
	 * 	});
	 * @class core.component.base
	 * @extends core.event.emitter
	 */

	var UNDEFINED;
	var ARRAY_PROTO = Array.prototype;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var ARRAY_SLICE = ARRAY_PROTO.slice;
	var CONFIGURATION = "configuration";
	var LENGTH = "length";
	var CONTEXT = "context";
	var NAME = "name";
	var TYPE = "type";
	var VALUE = "value";
	var PHASE = "phase";
	var STOP = "stop";
	var INITIALIZE = "initialize";
	var STARTED = "started";
	var FINALIZED = "finalized";
	var FINISHED = "finished";
	var SIG = "sig";
	var ON = "on";
	var EMITTER_PROTO = Emitter.prototype;
	var EMITTER_ON = EMITTER_PROTO.on;
	var EMITTER_OFF = EMITTER_PROTO.off;
	var EMITTER_EMIT = EMITTER_PROTO.emit;
	var EMITTER_REEMITT = EMITTER_PROTO.reemit;

	return Emitter.extend(function Component() {
		var me = this;

		// Set configuration
		me[CONFIGURATION] = {};

		var specials = me.constructor.specials;
		var events = ARRAY_PROTO.concat(specials[SIG], specials[ON]);
		var event;
		var i;
		var iMax;

		for (i = 0, iMax = events[LENGTH]; i < iMax; i++) {
			if ((event = events[i]) === UNDEFINED) {
				continue;
			}

			// As an exception, declarative event handler defined with "on/foo" will be translated
			// to emitter.on("foo", handler).
			EMITTER_ON.call(me, event.group === ON ? event[TYPE] : event[NAME], me, event[VALUE]);
		}

	}, {
		"displayName" : "core/component/base",

		/**
		 * Add to the component configurations, possibly {@link utils.merge merge} with the existing ones.
		 *
		 * 		var List = Component.extend({
		 * 			"sig/start": function start() {
		 * 				// configure the List.
		 * 				this.configure({
		 * 					"type": "list",
		 * 					"cls": ["list"]
		 * 				});
		 * 			}
		 * 		});
		 * 		var Dropdown = List.extend({
		 * 			"sig/start": function start() {
		 * 				// configure the Dropdown.
		 * 				this.configure({
		 * 					"type": "dropdown",
		 * 					"cls": ["dropdown"],
		 * 					"shadow": true
		 * 				});
		 * 			}
		 * 		});
		 *
		 * 		var dropdown = new Dropdown();
		 *
		 * 		// Overwritten: "dropdown"
		 * 		print(dropdown.configuration.id);
		 * 		// Augmented: ["list","dropdown"]
		 * 		print(dropdown.configuration.cls);
		 * 		// Added: true
		 * 		print(dropdown.configuration.shadow);
		 *
		 * @param {Object...} [configs] Config(s) to add.
		 * @returns {Object} The new configuration.
		 */
		"configure" : function configure() {
			return merge.apply(this[CONFIGURATION], arguments);
		},

		/**
		 * @inheritdoc
		 * @localdoc Context of the callback will always be **this** object.
		 */
		"reemit" : function reemit(event, senile, callback) {
			var me = this;
			var args = [ event, senile, me ];

			// Add args
			ARRAY_PUSH.apply(args, ARRAY_SLICE.call(arguments, 2));

			// Forward
			return EMITTER_REEMITT.apply(me, args);
		},

		/**
		 * @inheritdoc
		 * @localdoc Context of the callback will always be **this** object.
		 */
		"on": function on(event) {
			var me = this;
			var args = [ event, me ];

			// Add args
			ARRAY_PUSH.apply(args, ARRAY_SLICE.call(arguments, 1));

			// Forward
			return EMITTER_ON.apply(me, args);
		},

		/**
		 * @inheritdoc
		 * @localdoc Context of the callback will always be **this** object.
		 */
		"off" : function off(event) {
			var me = this;
			var args = [ event, me ];

			// Add args
			ARRAY_PUSH.apply(args, ARRAY_SLICE.call(arguments, 1));

			// Forward
			return EMITTER_OFF.apply(me, args);
		},

		/**
		 * Signals the component
		 * @param _signal {String} Signal
		 * @return {Promise}
		 */
		"signal": function (_signal) {
			// Get arguments
			var args = ARRAY_SLICE.call(arguments);

			// Modify first argument
			args[0] = "sig/" + _signal;

			// Emit
			return EMITTER_EMIT.apply(this, args);
		},

		/**
		 * Start the component life-cycle.
		 * @param {...*} [args] arguments
		 * @return {Promise}
		 */
		"start" : function start(args) {
			var me = this;
			var signal = me.signal;
			var phase;

			// Check PHASE
			if ((phase = me[PHASE]) !== UNDEFINED && phase !== FINALIZED) {
				throw new Error("Can't transition phase from '" + phase + "' to '" + INITIALIZE + "'");
			}

			// Modify args to change signal (and store in PHASE)
			args = [ me[PHASE] = INITIALIZE ];

			// Add signal to arguments
			ARRAY_PUSH.apply(args, arguments);

			return signal.apply(me, args).then(function initialized(_initialized) {
				// Modify args to change signal (and store in PHASE)
				args[0] = me[PHASE] = "start";

				return signal.apply(me, args).then(function started(_started) {
					// Update phase
					me[PHASE] = STARTED;

					// Return concatenated result
					return ARRAY_PROTO.concat(_initialized, _started);
				});
			});
		},

		/**
		 * Stops the component life-cycle.
		 * @param {...*} [args] arguments
		 * @return {Promise}
		 */
		"stop" : function stop(args) {
			var me = this;
			var signal = me.signal;
			var phase;

			// Check PHASE
			if ((phase = me[PHASE]) !== STARTED) {
				throw new Error("Can't transition phase from '" + phase + "' to '" + STOP + "'");
			}

			// Modify args to change signal (and store in PHASE)
			args = [ me[PHASE] = STOP ];

			// Add signal to arguments
			ARRAY_PUSH.apply(args, arguments);

			return signal.apply(me, args).then(function stopped(_stopped) {
				// Modify args to change signal (and store in PHASE)
				args[0] = me[PHASE] = "finalize";

				return signal.apply(me, args).then(function finalized(_finalized) {
					// Update phase
					me[PHASE] = FINALIZED;

					// Return concatenated result
					return ARRAY_PROTO.concat(_stopped, _finalized);
				});
			});
		},

		/**
		 * Schedule a new promise that runs on this component, sends a "task" signal once finished.
		 *
		 * **Note:** It's recommended to use **this method instead of an ad-hoc promise** to do async lift on this component,
		 * since in additional to an ordinary promise, it also helps to track the context of any running promise,
		 * including it's name, completion time and a given ID.
		 *
		 * 	var widget = Widget.create({
		 * 		"sig/task" : function(promise) {
		 * 			print('task %s started at: %s, finished at: %s', promise.name, promise.started);
		 * 		}
		 * 	});
		 *
		 * 	widget.task(function(resolve) {
		 * 		$(this.$element).fadeOut(resolve);
		 * 	}, 'animate');
		 *
		 * @param {Function} resolver The task resolver function.
		 * @param {Function} resolver.resolve Resolve the task.
		 * @param {Function} resolver.reject Reject the task.
		 * @param {Function} resolver.notify Notify the progress of this task.
		 * @param {String} [name]
		 * @returns {Promise}
		 */
		"task" : function task(resolver, name) {
			var me = this;

			var promise = when
				.promise(resolver)
				.ensure(function () {
					promise[FINISHED] = new Date();
				});

			promise[CONTEXT] = me;
			promise[STARTED] = new Date();
			promise[NAME] = name;

			return me.signal("task", promise).yield(promise);
		}
	});
});
