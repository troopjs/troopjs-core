/*!
 * TroopJS base component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/**
 * The base component is the foundation for all components.
 * It provides base functionality for instance counting and default 'toString'
 */
define([ "compose", "config" ], function ComponentModule(Compose, config) {
	var COUNT = 0;

	return Compose(function Component() {
		this.instanceCount = COUNT++;
	}, {
		config : config,
		displayName : "component/base",

		toString : function toString() {
			var self = this;

			return self.displayName + "@" + self.instanceCount;
		}
	});
});
