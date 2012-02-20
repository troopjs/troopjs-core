/*!
 * TroopJS service component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "compose", "./gadget", "jquery" ], function WidgetModule(Compose, Gadget, $) {
	var UNDEFINED = undefined;
	var FUNCTION = Function;
	var $ELEMENT = "$element";
	var DISPLAYNAME = "displayName";
	var ATTR_WEAVE = "[data-weave]";
	var ATTR_WOVEN = "[data-woven]";

	/**
	 * Creates a proxy of the inner method 'render' with the 'op' parameter set
	 * 
	 * @param op name of jQuery method call
	 * @returns proxied render
	 */
	function renderProxy(op) {
		/**
		 * Renders contents into element
		 * 
		 * @param contents Template/String to render
		 * @param data If contents is a template, the data to render template
		 *        with
		 * @param deferred Deferred (optional)
		 * @returns Self
		 */
		function render(contents, data, deferred) {
			var self = this;

			// If contents is a function, call it
			if (contents instanceof FUNCTION) {
				contents = contents.call(self, data);
			}
			// otherwise data makes no sense
			else {
				deferred = data;
			}

			var $element = self[$ELEMENT];

			// Defer render (as weaving it may need to load async)
			var deferredRender = $.Deferred(function deferredRender(dfdRender) {
				// Call render
				op.call($element, contents);

				// Weave element
				self.weave($element, dfdRender);
			})
			.done(function renderDone() {
				// After render is complete, trigger "widget/refresh" with woven components
				$element.trigger("widget/refresh", arguments);
			});

			if (deferred) {
				deferredRender.then(deferred.resolve, deferred.reject);
			}

			return self;
		}

		return render;
	}

	return Compose(Gadget, function Widget(element, displayName) {
		var self = this;
		self[$ELEMENT] = $(element);
		self[DISPLAYNAME] = name || "component/widget";
	}, {
		before : renderProxy($.fn.before),
		after : renderProxy($.fn.after),
		html : renderProxy($.fn.html),
		append : renderProxy($.fn.append),
		prepend : renderProxy($.fn.prepend),

		weave : function weave($element, deferred) {
			var self = this;

			$element.find(ATTR_WEAVE).weave(deferred);

			return self;
		},

		unweave : function unweave($element) {
			var self = this;

			$element.find(ATTR_WOVEN).andSelf().unweave();

			return self;
		},

		empty : function empty(deferred) {
			var self = this;

			var $element = self[$ELEMENT];

			// Create deferred for emptying
			var emptyDeferred = $.Deferred(function emptyDeferred(dfd) {

				// Detach contents
				var $contents = $element.contents().detach();

				// Trigger refresh
				$element.trigger("widget/refresh", arguments);

				// Get DOM elements
				var contents = $contents.get();

				// Use timeout in order to yield
				setTimeout(function emptyTimeout() {
					try {
						// Remove elements from DOM
						$contents.remove();

						// Resolve deferred
						dfd.resolve(contents);
					}
					// If there's an error
					catch (e) {
						// Reject deferred
						dfd.reject(contents);
					}
				}, 0);
			});

			// If a deferred was passed, add resolve/reject
			if (deferred) {
				emptyDeferred.then(deferred.resolve, deferred.reject);
			}

			return self;
		},

		"dom/destroy" : function onDestroy(topic, $event) {
			var self = this;
			var destructor = self.destructor;
			var result = UNDEFINED;

			// Check if we have a destructor, then call it
			if (destructor instanceof FUNCTION) {
				result = destructor.call(self);
			}

			if (result !== false) {
				self.unweave(self[$ELEMENT]);
			}

			return result;
		}
	});
});
