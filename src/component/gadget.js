/*!
 * TroopJS gadget component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/**
 * The gadget trait provides life cycle management
 */
define([ "compose", "troopjs-compose/proto", "./base" ], function GadgetModule(Compose, proto, Component) {
	var NULL = null;
	var FUNCTION = Function;
	var RE = /^state\/(starting|started|stopping|stopped)(?:\/.*)?/;
	var STATES = "states";

	return Component.extend(function Gadget() {
		var self = this;

		Compose.call(self, {
			initialize : proto(self.initialize),
			finalize : proto(self.finalize)
		});
	}, {
		initialize : function initialize() {
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
						states[state] = [ value ];
					}

					// NULL value
					self[key] = NULL;
				}
			}

			return self;
		},

		state : function state(state) {
			var self = this;

			var states = self[STATES];
			var i;
			var values;

			if (state in states) {
				values = states[state];

				i = values.length;

				while (i--) {
					values[i].apply(self, arguments);
				}
			}

			return self;
		}
	});
});
