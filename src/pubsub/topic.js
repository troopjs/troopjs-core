/*!
 * TroopJS pubsub/topic
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "compose", "component/base" ], function TopicModule(Compose, Component) {
	var ARRAY = Array;

	return Compose(Component, function Topic(topic, publisher, parent) {
		var self = this;

		self.topic = topic;
		self.publisher = publisher;
		self.parent = parent;
	}, {
		toString : function toString() {
			return this.topic;
		},

		trace : function trace() {
			var current = this;
			var constructor = current.constructor;
			var parent;
			var item;
			var stack = "";
			var i;
			var iMax;

			while (current) {
				if (current.constructor === ARRAY) {
					for (i = 0, iMax = current.length; i < iMax; i++) {
						item = current[i];

						current[i] = item.constructor === constructor
							? item.trace()
							: item;
					}

					stack += current.join(",");
					break;
				}

				parent = current.parent;
				stack += parent ? current.publisher + ":" : current.publisher;
				current = parent;
			}

			return stack;
		}
	});
});