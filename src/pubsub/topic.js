/*!
 * TroopJS pubsub/topic module
 * @license TroopJS Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/*jshint strict:false, smarttabs:true, laxbreak:true */
/*global define:true */
define([ "../component/base", "troopjs-utils/unique" ], function TopicModule(Component, unique) {
	var TOSTRING = Object.prototype.toString;
	var TOSTRING_ARRAY = TOSTRING.call(Array.prototype);

	function comparator (a, b) {
		return a.publisherInstanceCount === b.publisherInstanceCount;
	}

	return Component.extend(function Topic(topic, publisher, parent) {
		var self = this;

		self.topic = topic;
		self.publisher = publisher;
		self.parent = parent;
		self.publisherInstanceCount = publisher.instanceCount;
	}, {
		displayName : "core/pubsub/topic",

		/**
		 * Generates string representation of this object
		 * @returns Instance topic
		 */
		toString : function toString() {
			return this.topic;
		},

		/**
		 * Traces topic origin to root
		 * @returns String representation of all topics traced down to root
		 */
		trace : function trace() {
			var current = this;
			var constructor = current.constructor;
			var parent;
			var item;
			var stack = "";
			var i;
			var u;
			var iMax;

			while (current) {
				if (TOSTRING.call(current) === TOSTRING_ARRAY) {
					u = unique.call(current, comparator);

					for (i = 0, iMax = u.length; i < iMax; i++) {
						item = u[i];

						u[i] = item.constructor === constructor
							? item.trace()
							: item.topic;
					}

					stack += u.join(",");
					break;
				}

				parent = current.parent;
				stack += parent
					? current.publisher + ":"
					: current.publisher;
				current = parent;
			}

			return stack;
		}
	});
});