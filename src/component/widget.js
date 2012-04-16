/*!
 * TroopJS widget component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/**
 * The widget trait provides common UI related logic
 */
define([ "compose", "./gadget", "jquery", "deferred" ], function WidgetModule(Compose, Gadget, $, Deferred) {
	var NULL = null;
	var FUNCTION = Function;
	var ARRAY_PROTO = Array.prototype;
	var SLICE = ARRAY_PROTO.slice;
	var UNSHIFT = ARRAY_PROTO.unshift;
	var RE = /^dom(?::(\w+))?\/([^\.]+(?:\.(.+))?)/;
	var REFRESH = "widget/refresh";
	var $ELEMENT = "$element";
	var ONE = "one";
	var BIND = "bind";
	var ATTR_WEAVE = "[data-weave]";
	var ATTR_WOVEN = "[data-woven]";

	/**
	 * Creates a proxy of the inner method 'handlerProxy' with the 'topic', 'widget' and handler parameters set
	 * @param topic event topic
	 * @param widget target widget
	 * @param handler target handler
	 * @returns {Function} proxied handler
	 */
	function eventProxy(topic, widget, handler) {
		/**
		 * Creates a proxy of the outer method 'handler' that first adds 'topic' to the arguments passed
		 * @returns result of proxied hanlder invocation
		 */
		return function handlerProxy() {
			// Add topic to front of arguments
			UNSHIFT.call(arguments, topic);

			// Apply with shifted arguments to handler
			return handler.apply(widget, arguments);
		};
	}

	/**
	 * Creates a proxy of the inner method 'render' with the 'op' parameter set
	 * @param op name of jQuery method call
	 * @returns {Function} proxied render
	 */
	function renderProxy(op) {
		/**
		 * Renders contents into element
		 * @param contents (Function | String) Template/String to render
		 * @param data (Object) If contents is a template - template data
		 * @param deferred (Deferred) Deferred (optional)
		 * @returns self
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
			var deferredRender = Deferred(function deferredRender(dfdRender) {
				// Call render
				op.call($element, contents);

				// Weave element
				self.weave($element, dfdRender);
			})
			.done(function renderDone() {
				// After render is complete, trigger "widget/refresh" with woven components
				$element.trigger(REFRESH, arguments);
			});

			if (deferred) {
				deferredRender.then(deferred.resolve, deferred.reject);
			}

			return self;
		}

		return render;
	}

	return Gadget.extend(function Widget($element, displayName) {
		var self = this;
		var $proxies = new Array();

		// Extend self
		Compose.call(self, {
			"build/dom" : function build() {
				var key = NULL;
				var value;
				var matches;
				var topic;

				// Loop over each property in widget
				for (key in self) {
					// Get value
					value = self[key];

					// Continue if value is not a function
					if (!(value instanceof FUNCTION)) {
						continue;
					}

					// Match signature in key
					matches = RE.exec(key);

					if (matches !== NULL) {
						// Get topic
						topic = matches[2];

						// Replace value with a scoped proxy
						value = eventProxy(topic, self, value);

						// Either ONE or BIND element
						$element[matches[2] === ONE ? ONE : BIND](topic, self, value);

						// Store in $proxies
						$proxies[$proxies.length] = [topic, value];

						// NULL value
						self[key] = NULL;
					}
				}

				return self;
			},

			/**
			 * Destructor for dom events
			 * @returns self
			 */
			"destroy/dom" : function destroy() {
				var $proxy;

				// Loop over subscriptions
				while ($proxy = $proxies.shift()) {
					$element.unbind($proxy[0], $proxy[1]);
				}

				return self;
			},

			"$element" : $element,
			"displayName" : displayName || "component/widget"
		});
	}, {
		/**
		 * Weaves all children of $element
		 * @param $element (jQuery) Element to weave
		 * @param deferred (Deferred) Deferred (optional)
		 * @returns self
		 */
		weave : function weave($element, deferred) {
			$element.find(ATTR_WEAVE).weave(deferred);

			return this;
		},

		/**
		 * Unweaves all children of $element _and_ self
		 * @param $element (jQuery) Element to unweave
		 * @returns self
		 */
		unweave : function unweave($element) {
			$element.find(ATTR_WOVEN).andSelf().unweave();

			return this;
		},

		/**
		 * Triggers event on $element
		 * @param $event (jQuery.Event | String) Event to trigger
		 * @returns self
		 */
		trigger : function trigger($event) {
			var self = this;

			self[$ELEMENT].trigger($event, SLICE.call(arguments, 1));

			return self;
		},

		/**
		 * Renders content and inserts it before $element
		 */
		before : renderProxy($.fn.before),

		/**
		 * Renders content and inserts it after $element
		 */
		after : renderProxy($.fn.after),

		/**
		 * Renders content and replaces $element contents
		 */
		html : renderProxy($.fn.html),

		/**
		 * Renders content and appends it to $element
		 */
		append : renderProxy($.fn.append),

		/**
		 * Renders content and prepends it to $element
		 */
		prepend : renderProxy($.fn.prepend),

		/**
		 * Empties widget
		 * @param deferred (Deferred) Deferred (optional)
		 * @returns self
		 */
		empty : function empty(deferred) {
			var self = this;

			var $element = self[$ELEMENT];

			// Create deferred for emptying
			var emptyDeferred = Deferred(function emptyDeferred(dfd) {

				// Detach contents
				var $contents = $element.contents().detach();

				// Trigger refresh
				$element.trigger(REFRESH, arguments);

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
		}
	});
});
