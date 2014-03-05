/*
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
	 * Writes a message to the console that is information alike,
	 * @method info
	 * @param {String} msg
	 */

	/**
	 * Writes a message to the console that is logging alike.
	 * @method log
	 * @param {String} msg
	 */

	/**
	 * Writes a message to the console that is debugging alike.
	 * @method debug
	 * @param {String} msg
	 */

	/**
	 * Writes a message to the console that is warning alike.
	 * @method warn
	 * @param {String} msg
	 */

	/**
	 * Writes a message to the console that is actually an error.
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
