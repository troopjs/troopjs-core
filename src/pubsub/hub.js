/*!
 * TroopJS pubsub/hub module
 * @license TroopJS Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/*jshint strict:false, smarttabs:true */
/*global define:true */
define([ "compose", "../component/base" ], function HubModule(Compose, Component) {

	var from = Compose.from;

	return Compose.create(Component, {
		displayName: "core/pubsub/hub",
		subscribe : from(Component, "on"),
		unsubscribe : from(Component, "off"),
		publish : from(Component, "emit")
	});
});
