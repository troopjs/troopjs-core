/**
 * TroopJS core/logger/console
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define([ "compose", "../component/base" ], function ConsoleLogger(Compose, Component) {
	var CONSOLE = console;

	// adapted from Mozilla Developer Network example at
	// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
	var bind = Function.prototype.bind || function (obj) {
		var args = slice.call(arguments, 1),
			self = this,
			nop = function () {},
			bound = function () {
				return self.apply(this instanceof nop ? this : (obj || {}), args.concat(slice.call(arguments)));
			};
		nop.prototype = this.prototype || {}; // Firefox cries sometimes if prototype is undefined
		bound.prototype = new nop();
		return bound;
	};

	return Compose.create(Component, {
		"log" : bind.call(CONSOLE.log, CONSOLE),
		"warn" : bind.call(CONSOLE.warn || CONSOLE.log, CONSOLE),
		"debug" : bind.call(CONSOLE.debug || CONSOLE.log, CONSOLE),
		"info" : bind.call(CONSOLE.info || CONSOLE.log, CONSOLE),
		"error" : bind.call(CONSOLE.error || CONSOLE.log, CONSOLE)
	});
	
});