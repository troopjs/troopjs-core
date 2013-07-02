/*!
 * TroopJS widget/application component
 * @license TroopJS Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "../component/widget", "troopjs-utils/deferred", "troopjs-utils/when" ], function ApplicationModule(Widget, Deferred, When) {
	var ARRAY_SLICE = Array.prototype.slice;
	var SERVICES = "services";

	/**
	 * Forwards signals to services
	 * @param signal Signal
	 * @param deferred Deferred
	 * @returns me
	 */
	function forward(signal, deferred) {
		var me = this;

		var services = tr.call(me[SERVICES], function (service) {
			return Deferred(function (dfd) {
				service.signal(signal, dfd);
			});
		});

		if (deferred) {
			When.apply($, services).then(deferred.resolve, deferred.reject, deferred.notify);
		}

		me.publish("application/signal/" + signal, deferred);

		return me;
	}

	return Widget.extend(function ApplicationWidget($element, name) {
		this[SERVICES] = ARRAY_SLICE.call(arguments, 2);
	}, {
		displayName : "core/widget/application",

		"sig/initialize" : forward,

		"sig/start" : function start(signal, deferred) {
			var me = this;

			Deferred(function (dfd) {
				forward.call(me, signal, dfd);
			})
				.then(function () {
					me.weave(deferred);
				}, deferred.reject, deferred.progress);
		},

		"sig/stop" : function stop(signal, deferred) {
			var me = this;

			Deferred(function (dfd) {
				forward.call(me, signal, dfd);
			})
				.then(function () {
					me.unweave(deferred);
				}, deferred.reject, deferred.progress);
		},

		"sig/finalize" : forward
	});
});