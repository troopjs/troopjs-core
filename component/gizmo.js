/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"./base",
	"./factory",
	"when"
], function (Component, factory, when) {
	"use strict";

	/**
	 * Component that provides functionality to depend and interact
	 *
	 * @class core.component.gizmo
	 * @extend core.component.base
	 * @localdoc Adds convenience methods and specials to interact with other components
	 */


	var NULL = null;
	var USE = "use";
	var ARGS = "args";
	var NAME = "name";
	var VALUE = "value";
	var CALLBACK = "callback";
	var CONTEXT = "context";
	var RE = new RegExp("^" + USE + "/(.+)");

	/**
	 * @method constructor
	 * @inheritdoc
	 */
	return Component.extend({
		"displayName" : "core/component/gizmo",

		/**
		 * @inheritdoc
		 * @localdoc Registers event handlers declared USE specials
		 * @handler
		 */
		"sig/initialize" : function () {
			var me = this;

			return when.map(me.constructor.specials[USE] || false, function (special) {
				return me.on(special[NAME], special[VALUE], special[ARGS][0]);
			});
		},

		/**
		 * @inheritdoc
		 * @localdoc Registers an event handler on the used module
		 * @handler
		 */
		"sig/add": function (handlers, type, callback, event) {
			var me = this;
			var matches;

			if ((matches = RE.exec(type)) !== NULL) {
				return me.use(matches[1]).tap(function (modules) {
					var _callback = {};
					_callback[CALLBACK] = callback;
					_callback[CONTEXT] = me;
					modules[0].on(event, _callback);
				});
			}
		},

		/**
		 * @inheritdoc
		 * @localdoc Removes an event handler on the used module
		 * @handler
		 */
		"sig/remove": function (handlers, type, callback, event) {
			var me = this;
			var matches;

			if ((matches = RE.exec(type)) !== NULL) {
				return me.use(matches[1]).tap(function (modules) {
					var _callback = {};
					_callback[CALLBACK] = callback;
					_callback[CONTEXT] = me;
					modules[0].off(event, _callback);
				});
			}
		},

		/**
		 * @inheritdoc core.component.factory#method-constructor
		 * @localdoc Scope will be `this`
		 * @method
		 */
		"use": factory
	});
});