/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"../mixin/base",
	"poly/function"
], function ConsoleLogger(Base) {
	"use strict";

	/**
	 * Module that provides simple logging feature as a wrapper around the "console" global ever found.
	 * @class core.logger.console
	 * @extends core.mixin.base
	 * @singleton
	 */

	/*jshint devel:true*/
	var CONSOLE = window.console;

	function noop() {}

	var spec = {};

	[ "info","log","debug","warn","error" ].reduce(function(memo, feature) {
			memo[feature] =
				typeof CONSOLE != 'undefined' && CONSOLE[feature] ? CONSOLE[feature].bind(CONSOLE) : noop;
			return memo;
	}, spec);

	/**
	 * Logs a message that is information like
	 * @localdoc Writes the log message to the console
	 * @method info
	 * @param {String} msg
	 */

	/**
	 * Logs a message that is logging like
	 * @localdoc Writes the log message to the console
	 * @method log
	 * @param {String} msg
	 */

	/**
	 * Logs a message that is debugging like
	 * @localdoc Writes the log message to the console
	 * @method debug
	 * @param {String} msg
	 */

	/**
	 * Logs a message that is warning like
	 * @localdoc Writes the log message to the console
	 * @method warn
	 * @param {String} msg
	 */

	/**
	 * Logs a message that is actually an error
	 * @localdoc Writes the log message to the console
	 * @method error
	 * @param {String} msg
	 */

	/**
	 * @method create
	 * @static
	 * @hide
	 */

	/**
	 * @method extend
	 * @static
	 * @hide
	 */

	/**
	 * @method constructor
	 * @hide
	 */

	return Base.create({
			"displayName" : "core/logger/console"
		},
		spec);
});
