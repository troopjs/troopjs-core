/*!
 * TroopJS data/read module
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "compose" , "../component/gadget", "../pubsub/topic", "./cache", "deferred", "../util/merge"], function ReadModule(Compose, Gadget, Topic, cache, Deferred, merge) {
	var ARRAY_PROTO = Array.prototype;
	var SLICE = ARRAY_PROTO.slice;
	var CONCAT = ARRAY_PROTO.concat;
	var PUSH = ARRAY_PROTO.push;
	var LENGTH = "length";
	var INTERVAL = "interval";
	var BATCHES = "batches";
	var NEWLINE = "\n";
	var RE_ID = /^(\w+![\w\d\-_]+)/gm;

	/**
	 * Creates a scoped proxy for interval
	 * @param self Self
	 * @returns Scoped interval
	 */
	function intervalProxy(self) {
		function interval() {
			var batches = self[BATCHES];

			// Return fast if there is nothing to do
			if (batches[LENGTH] === 0) {
				return;
			}

			// Reset batches
			self[BATCHES] = [];

			var deferred = [];

			Deferred(function deferredRequest(dfdRequest) {
				var queries = [];
				var topics = [];
				var batch;
				var dfd;
				var i;
				var iMax;

				// Step through batches
				for (i = 0, iMax = batches[LENGTH]; i < iMax; i++) {
					// Get batch
					batch = batches[i];

					// Get deferred
					dfd = batch.deferred;

					// Add reject to dfdRequest
					dfdRequest.fail(dfd.reject);

					// Add batch.query to queries
					PUSH.apply(queries, batch.query);

					// Add batch.topic to topics
					PUSH.call(topics, batch.topic);

					// Add dfd to deferred
					PUSH.call(deferred, dfd);
				}

				// Publish ajax
				self.publish(Topic("ajax", self, topics), merge.call({
					"data": {
						"q": queries.join("|")
					}
				}, self.config.api.read), dfdRequest);
			})
			.done(function requestDone(data, textStatus, jqXHR) {
				var dfd;
				var guids;
				var i;
				var j;
				var iMax;
				var jMax;

				// Add all new data to cache
				cache.put(data);

				// Step through deferred
				for (i = 0, iMax = deferred[LENGTH]; i < iMax; i++) {
					// Get deferred
					dfd = deferred[i];

					// Get guids
					guids = dfd.guids;

					// Fill guids from cache
					for (j = 0, jMax = guids[LENGTH]; j < jMax; j++) {
						guids[j] = cache[guids[j]];
					}

					// Resolve original deferred
					dfd.resolve.apply(dfd, guids);
				}
			});
		}

		return interval;
	}

	return Compose.create(Gadget, function Read() {
		var self = this;

		self[BATCHES] = [];

		// Build and Start
		self
			.build()
			.start();
	}, {
		displayName : "data/read",

		"hub/read" : function read(topic, query /*, query, query, .., */, deferred) {
			var self = this;
			var length = arguments.length - 1;
			var batches = self[BATCHES];

			// Update (multi) query
			query = CONCAT.apply(ARRAY_PROTO, SLICE.call(arguments, 1, length));

			// Update deferred
			deferred = arguments[length];

			// Deferred read
			Deferred(function readDeferred(dfd) {
				var matches;
				var guids = dfd.guids = [];

				// Get all id's from queries
				while(matches = RE_ID.exec(query.join(NEWLINE))) {
					guids.push(matches[1]);
				}

				// Add batch to batches
				batches.push({
					topic: topic,
					query: query,
					deferred: dfd
				});
			}).then(deferred.resolve, deferred.reject);
		},

		start : function start(millisec) {
			var self = this;

			if (self.hasOwnProperty(INTERVAL)) {
				self.stop();
			}

			self[INTERVAL] = setInterval(intervalProxy(self), millisec | 200);

			return self;
		},

		stop : function stop() {
			var self = this;

			if (self.hasOwnProperty(INTERVAL)) {
				clearInterval(self[INTERVAL]);
				delete self[INTERVAL];
			}

			return self;
		}
	});
});
