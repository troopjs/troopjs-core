/*!
 * TroopJS route/router module
 * @license TroopJS Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "../component/service", "troopjs-utils/uri" ], function RouterModule(Service, URI) {
	var HASHCHANGE = "hashchange";
	var $ELEMENT = "$element";
	var ROUTE = "route";
	var RE = /^#/;

	function onHashChange($event) {
		var self = $event.data;

		// Create URI
		var uri = URI($event.target.location.hash.replace(RE, ""));

		// Convert to string
		var route = uri.toString();

		// Did anything change?
		if (route !== self[ROUTE]) {
			// Store new value
			self[ROUTE] = route;

			// Publish route
			self.publish(ROUTE, uri);
		}
	}

	return Service.extend(function RouterService($element) {
		this[$ELEMENT] = $element;
	}, {
		displayName : "core/route/router",

		"sig/initialize" : function initialize(signal, deferred) {
			var self = this;

			self[$ELEMENT].bind(HASHCHANGE, self, onHashChange);

			if (deferred) {
				deferred.resolve();
			}

			return self;
		},

		"sig/start" : function start(signal, deferred) {
			var self = this;

			self[$ELEMENT].trigger(HASHCHANGE);

			if (deferred) {
				deferred.resolve();
			}

			return self;
		},

		"sig/finalize" : function finalize(signal, deferred) {
			var self = this;

			self[$ELEMENT].unbind(HASHCHANGE, onHashChange);

			if (deferred) {
				deferred.resolve();
			}

			return self;
		}
	});
});