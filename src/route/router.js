/*!
 * TroopJS route/router module
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "compose", "../component/service", "../util/uri" ], function RouterModule(Compose, Service, URI) {
	var NULL = null;
	var $ELEMENT = "$element";
	var HASHCHANGE = "hashchange";
	var after = Compose.after;

	return Compose.create(Service, function RouterService() {
		var oldUri = NULL;
		var newUri = NULL;

		function onHashChange($event) {
			// Create URI
			uri = URI($event.target.location.hash.replace(/^#/, ""));

			// Convert to string
			newUri = uri.toString();

			// Did anything change?
			if (newUri !== oldUri) {
				// Store new value
				oldUri = newUri;

				// Publish route
				$event.data.publish("route", uri);
			}
		}

		Compose.call(this, {
			state : after(function state(state) {
				var self = this;

				switch(state) {
				case "starting" :
					self[$ELEMENT].bind(HASHCHANGE, self, onHashChange);
					break;

				case "started" :
					self[$ELEMENT].trigger(HASHCHANGE);
					break;

				case "stopping" :
					self[$ELEMENT].unbind(HASHCHANGE, onHashChange);
					break;
				}

				return self;
			})
		});
	}, {
		displayName : "service/router",

		initialize : function initialize($element) {
			var self = this;

			self[$ELEMENT] = $element;

			return self;
		},

		finalize : function finalize() {
			var self = this;

			delete self[$ELEMENT];

			return self;
		}
	});
});