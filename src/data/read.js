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

	function read(topic, query /*, query, query, .., */, deferred) {
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
	}

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

			var batch;
			var topic;
			var _query = [];
			var _topic = [];
			var _deferred = [];
			var deferred;
			var i;
			var iMax;

			var requestDeferred = Deferred()
				.done(function requestDone(data, textStatus, jqXHR) {
					var deferred;
					var results;
					var i;
					var j;
					var iMax;
					var jMax;

					// Add all new data to cache
					cache.put(data);

					for (i = 0, iMax = _deferred[LENGTH]; i < iMax; i++) {
						deferred = _deferred[i];
						results = deferred.guids;

						// Fill results from cache
						for (j = 0, jMax = results[LENGTH]; j < jMax; j++) {
							results[j] = cache[results[j]];
						}

						// Resolve original deferred
						deferred.resolve.apply(deferred, results);
					}
				});

			// Step through batches
			for (i = 0, iMax = batches[LENGTH]; i < iMax; i++) {
				batch = batches[i];
				topic = batch.topic;
				deferred = batch.deferred;

				// Add reject to requestDeferred
				requestDeferred.fail(deferred.reject);

				// Merge query
				PUSH.apply(_query, batch.query);

				// Add deferred to end of _deferred
				PUSH.call(_topic, topic);

				// Add deferred to end of _deferred
				PUSH.call(_deferred, deferred);
			}

			// Publish hub/ajax
			self.publish(new Topic("hub/ajax", self, _topic), merge.call({
				"data": {
					"q": _query.join("|")
				}
			}, self.config.api.read), requestDeferred);
		}

		return interval;
	}

	return Compose.create(Gadget, function Read() {
		var self = this;

		self[BATCHES] = [];

		self
			.subscribe("hub/read", self, read)
			.start();
	}, {
		displayName : "data/read",

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
