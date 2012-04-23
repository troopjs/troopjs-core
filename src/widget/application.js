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

	return Widget.extend({
		start : function start(deferred) {
			var self = this;

			Deferred(function deferredStart(dfdStart) {
				try {
					self.publish(APPLICATION_STATE, STARTING);

					Deferred(function deferredWeave(dfdWeave) {
						self.weave(dfdWeave);
					})
					.done(function weaveDone() {
						dfdStart.resolve(STARTED);
					})
					.fail(dfdStart.reject);

				}
				catch (e) {
					dfdStart.reject(e);
				}

				if (deferred) {
					dfdStart.then(deferred.resolve, deferred.reject);
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

			Deferred(function deferredStop(dfdStop) {
				try {
					self.publish(APPLICATION_STATE, STOPPING);

					self.unweave();

					dfdStop.resolve(STOPPED);
				}
				catch (e) {
					dfdStop.reject(e);
				}

				if (deferred) {
					dfdStop.then(deferred.resolve, deferred.reject);
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