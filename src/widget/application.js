/*!
 * TroopJS widget/application component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "compose", "../component/widget", "deferred" ], function ApplicationModule(Compose, Widget, Deferred) {
	var after = Compose.after;

	return Widget.extend({
		state : after(function state(state) {
			return this.publish("state", state);
		}),

		start : function start(deferred) {
			var self = this;

			Deferred(function deferredStart(dfdStart) {
				try {
					self.state("starting");

					Deferred(function deferredWeave(dfdWeave) {
						self.weave(dfdWeave);
					})
					.done(function weaveDone() {
						dfdStart.resolve("started");
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
				self.state(state);
			})
			.fail(function failStart(e) {
				self.state(e);
			});

			return self;
		},

		stop : function stop(deferred) {
			var self = this;

			Deferred(function deferredStop(dfdStop) {
				try {
					self.state("stopping");

					self.unweave();

					dfdStop.resolve("stopped");
				}
				catch (e) {
					dfdStop.reject(e);
				}

				if (deferred) {
					dfdStop.then(deferred.resolve, deferred.reject);
				}
			})
			.done(function doneStop(state) {
				self.state(state);
			})
			.fail(function failStop(e) {
				self.state(e);
			});

			return self;
		}
	});
});