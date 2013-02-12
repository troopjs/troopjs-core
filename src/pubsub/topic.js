/**
 * TroopJS core/pubsub/topic
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define([ "../component/base", "troopjs-utils/unique" ], function TopicModule(Component, unique) {
	/*jshint strict:false, smarttabs:true, laxbreak:true */

	var TOSTRING = Object.prototype.toString;
	var TOSTRING_ARRAY = TOSTRING.call(Array.prototype);
	var TOPIC = "topic";
	var PUBLISHER = "publisher";
	var PARENT = "parent";
	var CONSTRUCTOR = "constructor";
	var PUBLISHER_INSTANCE_COUNT = "publisherInstanceCount";

	function comparator (a, b) {
		return a[PUBLISHER_INSTANCE_COUNT] === b[PUBLISHER_INSTANCE_COUNT];
	}

	return Component.extend(function Topic(topic, publisher, parent) {
		var self = this;

		self[TOPIC] = topic;
		self[PUBLISHER] = publisher;
		self[PARENT] = parent;
		self[PUBLISHER_INSTANCE_COUNT] = publisher.instanceCount;
	}, {
		"displayName" : "core/pubsub/topic",

		/**
		 * Traces topic origin to root
		 * @returns String representation of all topics traced down to root
		 */
		"trace" : function trace() {
			var current = this;
			var constructor = current[CONSTRUCTOR];
			var item;
			var stack = "";
			var i;
			var u;
			var iMax;

			while (current) {
				if (TOSTRING.call(current) === TOSTRING_ARRAY) {
					unique.call(current, comparator);

					for (i = 0, iMax = current.length; i < iMax; i++) {
						item = current[i];

						current[i] = item[CONSTRUCTOR] === constructor
							? item.trace()
							: item[TOPIC];
					}

					stack += current.join(",");
					break;
				}

				stack += PARENT in current
					? current[PUBLISHER] + ":"
					: current[PUBLISHER];

				current = current[PARENT];
			}

			return stack;
		},

		/**
		 * Generates string representation of this object
		 * @returns {String} Instance topic
		 */
		"toString" : function _toString() {
			return this[TOPIC];
		}
	});
});
