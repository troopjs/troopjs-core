/*!
 * TroopJS base component
 * @license TroopJS Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/*jshint strict:false, smarttabs:true */
/*global define:true */
define([ "compose", "config" ], function ComponentModule(Compose, config) {
	var COUNT = 0;

	var Component = Compose(function Component() {
		this.instanceCount = COUNT++;
	}, {
		displayName : "core/component",

		/**
		 * Application configuration
		 */
		config : config
	});

	/**
	 * Generates string representation of this object
	 * @returns Combination displayName and instanceCount
	 */
	Component.prototype.toString = function () {
		var self = this;

		return self.displayName + "@" + self.instanceCount;
	};

	return Component;
});
