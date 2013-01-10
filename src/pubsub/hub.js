/*!
 * TroopJS pubsub/hub module
 * @license TroopJS Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/*global define:false */
define([ "compose", "../component/base" ], function HubModule(Compose, Component) {
	/*jshint strict:false, smarttabs:true */

	var from = Compose.from;

	return Compose.create(Component, {
		displayName: "core/pubsub/hub",
		subscribe : from(Component, "on"),
		unsubscribe : from(Component, "off"),
		publish : from(Component, "emit"),
		republish : from(Component, "reemit")
	});
});
