/*!
 * TroopJS widget/application component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "../component/widget", "deferred" ], function ApplicationModule(Widget, Deferred) {
	var STARTED = "started";
	var STOPPED = "stopped";

	return Widget.extend({
		state : function state(state, deferred) {
			var self = this;

			// Publish state to services
			self.publish("state", state);

			switch (state) {
			case STARTED:
				self.weave(deferred);
				break;

			case STOPPED:
				self.unweave();

			default:
				if (deferred) {
					deferred.resolve();
				}
			}

			return self;
		},

		start : function start(deferred) {
			var self = this;

			Deferred(function deferredStart(dfdStart) {
				Deferred(function deferredStarting(dfdStarting) {
					self.state("starting", dfdStarting);
				})
				.done(function doneStarting() {
					self.state(STARTED, dfdStart);
				});

				if (deferred) {
					dfdStart.then(deferred.resolve, deferred.reject);
				}
			});

			return self;
		},

		stop : function stop(deferred) {
			var self = this;

			Deferred(function deferredStop(dfdStop) {
				Deferred(function deferredStopping(dfdStopping) {
					self.state("stopping", sfdStopping);
				})
				.done(function doneStopping() {
					self.state(STOPPED, dfdStop);
				});

				if (deferred) {
					dfdStop.then(deferred.resolve, deferred.reject);
				}
			});

			return self;
		}
	});
});