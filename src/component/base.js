/*!
 * TroopJS base component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/**
 * The base trait provides functionality for instance counting
 * and a default 'toString' method.
 */
define([ "compose", "config" ], function ComponentModule(Compose, config) {
	var COUNT = 0;

	return Compose(function Component() {
		this.instanceCount = COUNT++;
	}, {
		// Application configuration
		config : config,

		// Default display name for components
		displayName : "component/base",

		/**
		 * Combines displayName and instanceCount
		 * @returns
		 */
		toString : function toString() {
			var self = this;

			return self.displayName + "@" + self.instanceCount;
		}
	});
});
