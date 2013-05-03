/**
 * TroopJS core/logger/console
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define([ "compose", "../component/base" ], function ConsoleLogger(Compose, Component) {
    return Compose.create(Component, console);
});