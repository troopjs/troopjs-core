/*!
 * TroopJS widget/placeholder component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "../component/widget", "jquery", "deferred" ], function WidgetPlaceholderModule(Widget, $, Deferred) {
	var UNDEFINED = undefined;
	var ARRAY = Array;
	var ARRAY_PROTO = ARRAY.prototype;
	var HOLDING = "holding";
	var DATA_HOLDING = "data-" + HOLDING;
	var $ELEMENT = "$element";
	var TARGET = "target";

	function release(/* arg, arg, arg, deferred*/) {
		var self = this;

		// Make arguments into a real array
		var argx  = ARRAY.apply(ARRAY_PROTO, arguments);

		// Update deferred to the last argument
		var deferred = argx.pop();

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
				// Set something in HOLDING
				self[HOLDING] = UNDEFINED;

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

				// Append values from argx to argv
				for (i = 0, iMax = argx.length; i < iMax; i++) {
					argv[i + 2] = argx[i];
				}

				// Require widget by name
				require([ name ], function required(Widget) {
					// Resolve with constructed, bound and initialized instance
					var widget = Widget
						.apply(Widget, argv)
						.initialize();

					Deferred(function deferredStarted(dfdStarted) {
						Deferred(function deferredStarting(dfdStarting) {
							widget.state("starting", dfdStarting);
						})
						.done(function doneStarting() {
							widget.state("started", dfdStarted);
						});
					})
					.done(function doneStarted() {
						dfd.resolve(widget);
					});
				});
			}

			// Link deferred
			if (deferred) {
				dfd.then(deferred.resolve, deferred.reject);
			}
		});

		return self;
	}

	function hold() {
		var self = this;
		var widget;

		// Check that we are holding
		if (HOLDING in self) {
			// Get what we're holding
			widget = self[HOLDING];

			// Cleanup
			delete self[HOLDING];

			// Remove DATA_HOLDING attribute
			self[$ELEMENT].removeAttr(DATA_HOLDING);

			// State and finalize TODO add a wrapping deferred for the whole uhold
			Deferred(function deferredStopped(dfdStopped) {
				Deferred(function deferredStopping(dfdStopping) {
					widget.state("stopping", dfdStopping);
				})
				.done(function doneStopping() {
					widget.state("stopped", dfdStopped);
				});
			})
			.done(function doneStopped() {
				widget.finalize();
			});
		}

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