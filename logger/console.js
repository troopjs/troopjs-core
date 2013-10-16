/*
 * TroopJS core/logger/console
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([ "../component/base", "poly/function" ], function ConsoleLogger(Component) {
	"use strict";

	/*jshint devel:true*/
	var CONSOLE = console;

	function noop() {}

	var spec = {};
	["info","log","debug","warn","error"].reduce(function(memo, feature) {
			memo[feature] =
				typeof CONSOLE != 'undefined' && CONSOLE[feature] ? CONSOLE[feature] : noop;
			return memo;
	}, spec);

	/**
	 * Writes a message to the console that is information alike,
	 * @member core.logger.console
	 * @method info
	 * @param {String} msg
	 */

	/**
	 * Writes a message to the console that is logging alike.
	 * @member core.logger.console
	 * @method log
	 * @param {String} msg
	 */

	/**
	 * Writes a message to the console that is debugging alike.
	 * @member core.logger.console
	 * @method debug
	 * @param {String} msg
	 */

	/**
	 * Writes a message to the console that is warning alike.
	 * @member core.logger.console
	 * @method warn
	 * @param {String} msg
	 */

	/**
	 * Writes a message to the console that is actually an error.
	 * @member core.logger.console
	 * @method error
	 * @param {String} msg
	 */

	/**
	 * Module that provides simple logging feature as a wrapper around the "console" global ever found.
	 *
	 * @singleton
	 * @class core.logger.console
	 * @extends core.component.base
	 */
	return Component.create({
			"displayName" : "core/logger/console"
		},
		spec);
});