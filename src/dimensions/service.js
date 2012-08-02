/*!
 * TroopJS dimensions/service module
 * @license TroopJS Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "../component/service" ], function DimensionsServiceModule(Service) {
	var DIMENSIONS = "dimensions";
	var $ELEMENT = "$element";

	function onDimensions($event, w, h) {
		$event.data.publish(DIMENSIONS, w, h);
	}

	return Service.extend(function DimensionsService($element, dimensions) {
		var self = this;

		self[$ELEMENT] = $element;
		self[DIMENSIONS] = dimensions;
	}, {
		displayName : "core/dimensions/service",

		"sig/initialize" : function initialize(signal, deferred) {
			var self = this;

			self[$ELEMENT].bind(DIMENSIONS + "." + self[DIMENSIONS], self, onDimensions);

			if (deferred) {
				deferred.resolve();
			}
		},

		"sig/start" : function start(signal, deferred) {
			var self = this;

			self[$ELEMENT].trigger("resize." + DIMENSIONS);

			if (deferred) {
				deferred.resolve();
			}
		},

		"sig/finalize" : function finalize(signal, deferred) {
			var self = this;

			self[$ELEMENT].unbind(DIMENSIONS + "." + self[DIMENSIONS], onDimensions);

			if (deferred) {
				deferred.resolve();
			}
		}
	});
});