/*!
 * TroopJS widget component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/**
 * The widget trait provides common UI related logic
 */
define([ "./gadget", "jquery", "deferred" ], function WidgetModule(Gadget, $, Deferred) {
	var NULL = null;
	var FUNCTION = Function;
	var UNDEFINED = undefined;
	var ARRAY_PROTO = Array.prototype;
	var SHIFT = ARRAY_PROTO.shift;
	var UNSHIFT = ARRAY_PROTO.unshift;
	var POP = ARRAY_PROTO.pop;
	var $TRIGGER = $.fn.trigger;
	var $ONE = $.fn.one;
	var $BIND = $.fn.bind;
	var $UNBIND = $.fn.unbind;
	var RE = /^dom(?::(\w+))?\/([^\.]+(?:\.(.+))?)/;
	var REFRESH = "widget/refresh";
	var $ELEMENT = "$element";
	var $PROXIES = "$proxies";
	var ONE = "one";
	var THEN = "then";
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
	 * Creates a proxy of the inner method 'render' with the '$fn' parameter set
	 * @param $fn jQuery method
	 * @returns {Function} proxied render
	 */
	function renderProxy($fn) {
		/**
		 * Renders contents into element
		 * @param contents (Function | String) Template/String to render
		 * @param data (Object) If contents is a template - template data (optional)
		 * @param deferred (Deferred) Deferred (optional)
		 * @returns self
		 */
		function render(/* contents, data, ..., deferred */) {
			var self = this;
			var $element = self[$ELEMENT];
			var arg = arguments;

			// Get contents from first argument
			var contents = SHIFT.call(arg);

			// Get arg length
			var argc = arg.length;

			// Check if the last argument looks like a deferred, and in that case set it
			var deferred = argc > 0 && arg[argc - 1][THEN] instanceof FUNCTION
				? POP.call(arg)
				: UNDEFINED;

			// Call render with contents (or result of contents if it's a function)
			$fn.call($element, contents instanceof FUNCTION ? contents.apply(self, arg) : contents);

			// Defer render (as weaving it may need to load async)
			Deferred(function deferredRender(dfdRender) {
				// Weave element
				$element.find(ATTR_WEAVE).weave(dfdRender);

				// After render is complete, trigger REFRESH with woven components
				dfdRender.done(function renderDone() {
					$element.trigger(REFRESH, arguments);
				});

				// Link deferred
				if (deferred) {
					dfdRender.then(deferred.resolve, deferred.reject);
				}
			});

			return self;
		}

		return render;
	}

	return Gadget.extend(function Widget($element, displayName) {
		var self = this;

		self[$ELEMENT] = $element;

		if (displayName) {
			self.displayName = displayName;
		}
	}, {
		displayName : "core/component/widget",

		signal : function signal(signal, deferred) {
			var self = this;
			var $element = self[$ELEMENT];
			var $proxies;
			var $proxy;
			var key = NULL;
			var value;
			var matches;
			var topic;

			switch (signal) {
			case "initialize":
				// Reset proxies
				$proxies = self[$PROXIES] = [];

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
						(matches[2] === ONE ? $ONE : $BIND).call($element, topic, self, value);

						// Store in $proxies
						$proxies[$proxies.length] = [topic, value];

						// NULL value
						self[key] = NULL;
					}
				}
				break;

			case "finalize":
				// Get proxies
				$proxies = self[$PROXIES];

				// Loop over subscriptions
				while ($proxy = $proxies.shift()) {
					$element.unbind($proxy[0], $proxy[1]);
				}
				break;
			}

			if (deferred) {
				deferred.resolve();
			}

			return self;
		},

		/**
		 * Weaves all children of $element
		 * @param deferred (Deferred) Deferred (optional)
		 * @returns self
		 */
		weave : function weave(deferred) {
			var self = this;

			self[$ELEMENT].find(ATTR_WEAVE).weave(deferred);

			return self;
		},

		/**
		 * Unweaves all children of $element _and_ self
		 * @returns self
		 */
		unweave : function unweave() {
			var self = this;

			self[$ELEMENT].find(ATTR_WOVEN).andSelf().unweave();

			return this;
		},

		/**
		 * Binds event from $element, exactly once
		 * @returns self
		 */
		one : function one() {
			var self = this;

			$ONE.apply(self[$ELEMENT], arguments);

			return self;
		},

		/**
		 * Binds event to $element
		 * @returns self
		 */
		bind : function bind() {
			var self = this;

			$BIND.apply(self[$ELEMENT], arguments);

			return self;
		},

		/**
		 * Unbinds event from $element
		 * @returns self
		 */
		unbind : function unbind() {
			var self = this;

			$UNBIND.apply(self[$ELEMENT], arguments);

			return self;
		},

		/**
		 * Triggers event on $element
		 * @returns self
		 */
		trigger : function trigger() {
			var self = this;

			$TRIGGER.apply(self[$ELEMENT], arguments);

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
		 * Renders content and replaces $element contents
		 */
		text : renderProxy($.fn.text),

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

			// Create deferred for emptying
			Deferred(function emptyDeferred(dfd) {
				// If a deferred was passed, add resolve/reject
				if (deferred) {
					dfd.then(deferred.resolve, deferred.reject);
				}

				// Get element
				var $element = self[$ELEMENT];

				// Detach contents
				var $contents = $element.contents().detach();

				// Trigger refresh
				$element.trigger(REFRESH, self);

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

			return self;
		}
	});
});
