/*!
 * TroopJS route/router module
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "compose", "../component/service", "../util/uri" ], function RouterModule(Compose, Service, URI) {
	var NULL = null;
	var $ELEMENT = "$element";
	var HASHCHANGE = "hashchange";

	return Service.extend(function RouterService($element) {
		var oldUri = NULL;
		var newUri = NULL;

		this[$ELEMENT] = $element;

		function onHashChange($event) {
			// Create URI
			var uri = URI($event.target.location.hash.replace(/^#/, ""));

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
			signal : function signal(signal, deferred) {
				var self = this;

				switch(signal) {
				case "initialize" :
					self[$ELEMENT].bind(HASHCHANGE, self, onHashChange);
					break;

				case "start" :
					self[$ELEMENT].trigger(HASHCHANGE);
					break;

				case "finalize" :
					self[$ELEMENT].unbind(HASHCHANGE, onHashChange);
					break;
				}

				if (deferred) {
					deferred.resolve();
				}

				return self;
			}
		});
	}, {
		displayName : "core/route/router"
	});
});