/**
 * TroopJS core/pubsub/hub
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
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
