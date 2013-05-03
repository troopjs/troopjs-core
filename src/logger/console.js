/**
 * TroopJS core/logger/console
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define([ "compose", "../component/base" ], function ConsoleLogger(Compose, Component) {
	var CONSOLE = console;

	return Compose.create(Component, {
		"log" : CONSOLE.log.bind(CONSOLE),
		"warn" : CONSOLE.warn.bind(CONSOLE),
		"debug" : CONSOLE.debug.bind(CONSOLE),
		"info" : CONSOLE.info.bind(CONSOLE)
	});
});