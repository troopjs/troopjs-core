/*!
 * TroopJS widget/placeholder component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "compose", "../component/widget", "jquery", "deferred" ], function WidgetPlaceholderModule(Compose, Widget, $, Deferred) {
	var NULL = null;
	var UNDEFINED = undefined;
	var ARRAY = Array;
	var ARRAY_PROTO = ARRAY.prototype;
	var DATA_HOLDING = "data-holding";

	return Widget.extend(function WidgetPlaceholder($element, name, _name) {
		var self = this;
		var _widget = UNDEFINED;

		function release(/* arg, arg, arg, */ deferred) {
			// Internal deferred
			Deferred(function deferredRelease(dfd) {
				// Make arguments into a real array
				var argv  = ARRAY.apply(ARRAY_PROTO, arguments);

				// Update deferred to the last argument
				deferred = argv.pop();

				// We're already holding something, reject
				if (_widget !== UNDEFINED) {
					dfd.reject(_widget);
				}
				else try {
					// Set _widget to NULL to indicate that we're in progress
					_widget = NULL;

					// Initialize deferred
					dfd
						.done(function done(widget) {
							// Update _widget
							_widget = widget;

							// Set DATA_HOLDING attribute
							$element.attr(DATA_HOLDING, widget);
						})
						.fail(function fail(widget) {
							// Update _widget
							_widget = widget;
						});

					// Require widget by _name
					require([ _name ], function required(widget) {
						// If no additional arguments, do simple instantiation
						if (argv.length === 0) {
							widget = widget($element, _name);
						}
						// Otherwise, do a complicated one
						else {
							// Add $element and _name to the beginning of argv
							argv.unshift($element, _name);

							// Instantiate
							widget = widget.apply(widget, argv);
						}

						// Build
						widget.build();

						// Resolve
						dfd.resolve(widget);
					});
				}
				catch (e) {
					dfd.reject(UNDEFINED);
				}

				// Link deferred
				if (deferred) {
					dfd.then(deferred.resolve, deferred.reject);
				}
			});

			return this;
		}

		function hold(deferred) {
			// Internal deferred
			Deferred(function deferredHold(dfd) {
				// First check that we're holding
				if (_widget === UNDEFINED || _widget === NULL) {
					dfd.reject(_widget);
				}
				else try {
					// Initialize deferred
					dfd
						.done(function done(widget) {
							// Remove DATA_HOLDING attribute
							$element.removeAttr(DATA_HOLDING);

							// Update _widget
							_widget = UNDEFINED;
						})
						.fail(function fail(widget) {
							// Update _widget
							_widget = UNDEFINED;
						});

					// Destroy
					_widget.destroy();

					// Resolve
					dfd.resolve(_widget);
				}
				catch (e) {
					dfd.reject(_widget);
				}

				// Link deferred
				if (deferred) {
					dfd.then(deferred.resolve, deferred.reject);
				}
			});

			return this;
		}

		// Extend instance
		Compose.call(self, {
			release : release,
			hold : hold,
			destructor : hold
		});
	});
});