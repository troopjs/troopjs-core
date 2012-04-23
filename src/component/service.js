/*!
 * TroopJS service component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "./gadget" ], function ServiceModule(Gadget) {
	var NULL = null;
	var FUNCTION = Function;
	var RE = /^state\/(starting|started|stopping|stopped).*/;
	var APPLICATION_STATE = "application/state";
	var STATES = "states";

	function onApplicationState(topic, state) {
		var self = this;
		var states = self[STATES];
		var i;
		var values;

		if (state in states) {
			values = states[state];

			i = values.length;

			while (i--) {
				states[i].apply(self, arguments);
			}
		}
	}

	return Gadget.extend({
		begin : function begin() {
			var self = this;
			var key = NULL;
			var value;
			var matches;
			var states = self[STATES] = {};
			var state;

			// Loop over each property in service
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
					state = matches[1];

					if (state in states) {
						states[state].push(value);
					}
					else {
						states[level] = [ value ];
					}

					// NULL value
					self[key] = NULL;
				}
			}

			// Subscribe to INIT
			self.subscribe(APPLICATION_STATE, self, true, onApplicationState);

			return self;
		},

		finalize : function finalize() {
			this.unsubscribe(APPLICATION_STATE, onApplicationState);
		}
	});
});