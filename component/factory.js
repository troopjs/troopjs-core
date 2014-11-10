/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"../task/factory",
	"require",
	"when"
], function (taskFactory, localRequire, when) {

	/**
	 * @class core.component.factory
	 * @mixin Function
	 * @static
	 */

	var UNDEFINED;
	var NULL = null;
	var SCOPE = "scope";
	var COUNT = 0;
	var RE =/((?:\w+!)?([\w\/\.\-]+)(?:#[^(\s]+)?)(@\w*)?/;

	/**
	 * Creates and registers a component
	 * @method constructor
	 * @param {String...} module Module name
	 * @return {Promise}
	 */
	return function factory() {
		var me = this;

		return when.map(arguments, function (arg) {
			var matches;

			// matches[0] : max module with instance name - "mv!proxy/name#1.x@name"
			// matches[1] : max module - "mv!proxy/name#1.x"
			// matches[2] : min module - "proxy/name"
			// matches[3] : instance - "@name"
			if ((matches = RE.exec(arg)) !== NULL) {
				// Get or create `me[SCOPE]`
				var scope = me[SCOPE] || (me[SCOPE] = {});
				var instance = matches[3];

				// If `instance` is `UNDEFINED` let it be `@default`
				if (instance === UNDEFINED) {
					instance = "@default";
				}
				// If we're forcing new let it be `@new-(COUNT++)`
				else if (instance === "@") {
					instance = "@new-" + COUNT++;
				}

				// Let `key` be `matches[2] + instance`
				var key = matches[2] + instance;

				// If `scope` has `key` ...
				return scope.hasOwnProperty(key)
					// ... return it ...
					? scope[key]
					// ... otherwise create a task
					: scope[key] = taskFactory.call(me, function (resolve, reject) {
								// Require `matches[1]`
								localRequire([ matches[1] ], function (Module) {
									// Resolve with instantiated `Module`
									resolve(Module());
								}, reject);
						});
			}
			else {
				throw new Error("Unable to match '" + arg + "'");
			}
		});
	}
});