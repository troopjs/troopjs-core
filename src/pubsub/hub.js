/**
 * TroopJS core/pubsub/hub
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define([ "../component/base" ], function HubModule(Component) {
	/*jshint strict:false */

	var COMPONENT_PROTOTYPE = Component.prototype;

	return Component.extend({
		"displayName": "core/pubsub/hub",
		"subscribe" : COMPONENT_PROTOTYPE.on,
		"unsubscribe" : COMPONENT_PROTOTYPE.off,
		"publish" : COMPONENT_PROTOTYPE.emit,
		"republish" : COMPONENT_PROTOTYPE.reemit
	})();
});
