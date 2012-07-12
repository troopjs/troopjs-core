/*!
 * TroopJS widget/sandbox component
 * @license TroopJS Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define( [ "../component/widget", "jquery" ], function SandboxModule(Widget, $) {
	var $ELEMENT = "$element";
	var _$ELEMENT = "_" + $ELEMENT;

	return Widget.extend({
		"sig/initialize" : function onInitialize(signal, deferred) {
			var self = this;

			// Store ref to current $element
			var $element = self[_$ELEMENT] = self[$ELEMENT];

			// Get the contentWindow
			var contentWindow = $element.get(0).contentWindow;

			// Set $element to iframe document element
			self[$ELEMENT] = $(contentWindow.ownerDocument || contentWindow.document);

			if (deferred) {
				deferred.resolve();
			}
		},

		"sig/start" : function onStart(signal, deferred) {
			this.weave(deferred);
		},

		"sig/stop" : function onStop(signal, deferred) {
			this.unweave(deferred);
		}
	});
});
