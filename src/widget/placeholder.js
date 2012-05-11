/*!
 * TroopJS widget/placeholder component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "../component/widget", "jquery", "deferred" ], function WidgetPlaceholderModule(Widget, $, Deferred) {
	var UNDEFINED = undefined;
	var FUNCTION = Function;
	var ARRAY = Array;
	var ARRAY_PROTO = ARRAY.prototype;
	var POP = ARRAY_PROTO.pop;
	var HOLDING = "holding";
	var DATA_HOLDING = "data-" + HOLDING;
	var $ELEMENT = "$element";
	var TARGET = "target";
	var THEN = "then";

	function release(/* arg, arg, arg, deferred*/) {
		var self = this;
		var arg = arguments;
		var argc = arg.length;

		// Check if the last argument looks like a deferred, and in that case set it
		var deferred = argc > 0 && arg[argc - 1][THEN] instanceof FUNCTION
			? POP.call(arg)
			: UNDEFINED;

		Deferred(function deferredRelease(dfd) {
			var i;
			var iMax;
			var name;
			var argv;

			// We're already holding something, resolve with cache
			if (HOLDING in self) {
				dfd.resolve(self[HOLDING]);
			}
			else {
				// Add done handler to release
				dfd.done(function doneRelease(widget) {
					// Set DATA_HOLDING attribute
					self[$ELEMENT].attr(DATA_HOLDING, widget);

					// Store widget
					self[HOLDING] = widget;
				});

				// Get widget name
				name = self[TARGET];

				// Set initial argv
				argv = [ self[$ELEMENT], name ];

				// Append values from arg to argv
				for (i = 0, iMax = arg.length; i < iMax; i++) {
					argv[i + 2] = arg[i];
				}

				// Require widget by name
				require([ name ], function required(Widget) {
					// Resolve with constructed, bound and initialized instance
					var widget = Widget
						.apply(Widget, argv);

					Deferred(function deferredStart(dfdStart) {
						widget.start(dfdStart);
					})
					.done(function doneStarted() {
						dfd.resolve(widget);
					})
					.fail(dfd.reject);
				});
			}

			// Link deferred
			if (deferred) {
				dfd.then(deferred.resolve, deferred.reject);
			}
		});

		return self;
	}

	function hold(deferred) {
		var self = this;

		Deferred(function deferredHold(dfdHold) {
			var widget;

			// Check that we are holding
			if (HOLDING in self) {
				// Get what we're holding
				widget = self[HOLDING];

				// Cleanup
				delete self[HOLDING];

				// Remove DATA_HOLDING attribute
				self[$ELEMENT].removeAttr(DATA_HOLDING);

				// Stop
				Deferred(function deferredStop(dfdStop) {
					widget.stop(dfdStop);
				})
				.then(dfdHold.resolve, dfdHold.reject);
			}
			else {
				dfdHold.resolve();
			}

			// Link deferred
			if (deferred) {
				dfd.then(deferred.resolve, deferred.reject);
			}
		});

		return self;
	}

	return Widget.extend(function WidgetPlaceholder($element, name, target) {
		this[TARGET] = target;
	}, {
		displayName : "core/widget/placeholder",

		release : release,
		hold : hold,
		finalize : hold
	});
});