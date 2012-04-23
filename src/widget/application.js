/*!
 * TroopJS widget/application component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "compose", "../component/widget", "deferred" ], function ApplicationModule(Compose, Widget, Deferred) {
	var STARTING = "starting";
	var STARTED = "started";
	var STOPPING = "stopping";
	var STOPPED = "stopped";
	var APPLICATION_STATE = "application/state";
	var $ELEMENT = "$element";

	return Widget.extend({
		start : function start(deferred) {
			var self = this;

			Deferred(function deferredStart(dfd) {
				try {
					self.publish(APPLICATION_STATE, STARTING);

					self.weave(self[$ELEMENT]);

					dfd.resolve(STARTED);
				}
				catch (e) {
					dfd.reject(e);
				}

				if (deferred) {
					dfd.then(deferred.resolve, deferred.reject);
				}
			})
			.done(function doneStart(state) {
				self.publish(APPLICATION_STATE, state);
			})
			.fail(function failStart(e) {
				self.publish(APPLICATION_STATE, e);
			});

			return self;
		},

		stop : function stop(deferred) {
			var self = this;

			Deferred(function deferredStop(dfd) {
				try {
					self.publish(APPLICATION_STATE, STOPPING);

					self.unweave(self[$ELEMENT]);

					dfd.resolve(STOPPED);
				}
				catch (e) {
					dfd.reject(e);
				}

				if (deferred) {
					dfd.then(deferred.resolve, deferred.reject);
				}
			})
			.done(function doneStop(state) {
				self.publish(APPLICATION_STATE, state);
			})
			.fail(function failStop(e) {
				self.publish(APPLICATION_STATE, e);
			});

			return self;
		}
	});
});