/*!
 * TroopJS widget/placeholder component
 * @license TroopJS Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/*jshint strict:false, smarttabs:true, laxbreak:true */
/*global define:true */
define([ "../component/widget", "troopjs-utils/deferred" ], function WidgetPlaceholderModule(Widget, Deferred) {
	var FUNCTION = Function;
	var POP = Array.prototype.pop;
	var HOLDING = "holding";
	var DATA_HOLDING = "data-" + HOLDING;
	var $ELEMENT = "$element";
	var TARGET = "target";
	var THEN = "then";

	function release(/* arg, arg, arg, deferred*/) {
		var self = this;
		var arg = arguments;
		var argc = arg.length;

		// If deferred not a true Deferred, make it so
		var deferred = argc > 0 && arg[argc - 1][THEN] instanceof FUNCTION
			? POP.call(arg)
			: Deferred();

		Deferred(function deferredRelease(dfdRelease) {
			var i;
			var iMax;
			var name;
			var argv;

			// We're already holding something, resolve with cache
			if (HOLDING in self) {
				dfdRelease
					.done(deferred.resolve)
					.resolve(self[HOLDING]);
			}
			else {
				// Add done handler to release
				dfdRelease.then([ function doneRelease(widget) {
					// Set DATA_HOLDING attribute
					self[$ELEMENT].attr(DATA_HOLDING, widget);

					// Store widget
					self[HOLDING] = widget;
				}, deferred.resolve ], deferred.reject, deferred.notify);

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
					// Defer require
					Deferred(function deferredStart(dfdRequire) {
						// Constructed and initialized instance
						var widget = Widget
							.apply(Widget, argv);

						// Link deferred
						dfdRequire.then(function doneStart() {
							dfdRelease.resolve(widget);
						}, dfdRelease.reject, dfdRelease.notify);

						// Start
						widget.start(dfdRequire);
					});
				});
			}
		});

		return self;
	}

	function hold(deferred) {
		var self = this;

		deferred = deferred || Deferred();

		Deferred(function deferredHold(dfdHold) {
			var widget;

			// Link deferred
			dfdHold.then(deferred.resolve, deferred.reject, deferred.notify);

			// Check that we are holding
			if (HOLDING in self) {
				// Get what we're holding
				widget = self[HOLDING];

				// Cleanup
				delete self[HOLDING];

				// Remove DATA_HOLDING attribute
				self[$ELEMENT].removeAttr(DATA_HOLDING);

				// Stop
				widget.stop(dfdHold);
			}
			else {
				dfdHold.resolve();
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