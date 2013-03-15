/*!
 * TroopJS widget/placeholder component
 * @license TroopJS Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/*global define:true */
define([ "jquery", "../component/widget" ], function WidgetPlaceholderModule($, Widget) {
	/*jshint strict:false, laxbreak:true */

	var FUNCTION = Function;
	var ARRAY_PROTO = Array.prototype;
	var ARRAY_POP = ARRAY_PROTO.pop;
	var ARRAY_SLICE = ARRAY_PROTO.slice;
	var LENGTH = "length";
	var THEN = "then";
	var HOLDING = "holding";
	var $ELEMENT = "$element";
	var TARGET = "target";

	function release() {
		var self = this;
		var $element = self[$ELEMENT];
		var release_args = arguments;

		// Get or create deferred
		var deferred = release_args[LENGTH] > 0 && release_args[release_args[LENGTH] - 1][THEN] instanceof FUNCTION
			? ARRAY_POP.call(release_args)
			: $.Deferred();

		// We're already holding something, resolve with cache
		if (HOLDING in self) {
			deferred.resolve(self[HOLDING]);
		}
		else {
			$.Deferred(function (dfdWeave) {
				// Clone release_args
				var weave_args = ARRAY_SLICE.call(release_args);

				// Add dfdWeave to end of weave_args
				weave_args.push(dfdWeave);

				// Weave
				$element
					// Add data-weave attribute from self[TARGET]
					.attr("data-weave", self[TARGET])
					// Weave (passing arguments)
					.weave.apply($element, weave_args)
			})
			.then(function (widget) {
				// Store widget in holding
				self[HOLDING] = widget;

				// Resolve deferred with widget
				deferred.resolve(widget);
			}, deferred.reject, deferred.progress);
		}
	}

	function hold() {
		var self = this;
		var widget;
		var $element = self[$ELEMENT];
		var hold_args = arguments;

		// Get or create deferred
		var deferred = hold_args[LENGTH] > 0 && hold_args[hold_args[LENGTH] - 1][THEN] instanceof FUNCTION
			? ARRAY_POP.call(hold_args)
			: $.Deferred();

		// Check that we are holding
		if (HOLDING in self) {
			// Get what we're holding
			widget = self[HOLDING];

			// Cleanup
			delete self[HOLDING];

			$.Deferred(function (dfdUnweave) {

				// Clone hold_args
				var unweave_args = ARRAY_SLICE.call(hold_args);

				// Add dfdUnweave to end of unweave_args
				unweave_args.push(dfdUnweave);

				// Unweave
				$element
					// Add data-unweave attribute from widget
					.attr("data-unweave", widget)
					// Unweave (passing arguments)
					.unweave.apply($element, unweave_args);
			})
			.then(function () {
				deferred.resolve(widget);
			}, deferred.reject, deferred.progress);
		}
		else {
			return deferred.resolve();
		}

		return self;
	}

	return Widget.extend(function WidgetPlaceholder($element, name, target) {
		this[TARGET] = target;
	}, {
		displayName : "core/widget/placeholder",

		"sig/finalize" : function finalize(signal, deferred) {
			this.hold(deferred);
		},

		release : release,
		hold : hold
	});
});
