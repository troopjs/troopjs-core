/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"module",
	"troopjs-compose/config",
	"mu-merge"
], function (module, config, merge) {
	"use strict";

	/**
	 * @class core.config.phase
	 * @enum
	 * @private
	 */
	var PHASE = {
		/**
		 * Protected phases
		 */
		"skip": /^(?:initi|fin)alized?$/,
		/**
		 * Phase while component is initializing.
		 */
		"initialize": "initialize",
		/**
		 * Phase when component is initialized.
		 */
		"initialized": "initialized",
		/**
		 * Phase while component is starting.
		 */
		"start": "start",
		/**
		 * Phase when component is started.
		 */
		"started": "started",
		/**
		 * Phase while component is stopping.
		 */
		"stop": "stop",
		/**
		 * Phase when component is stopped.
		 */
		"stopped": "stopped",
		/**
		 * Phase while component is finalizing.
		 */
		"finalize": "finalize",
		/**
		 * Phase when component is finalized.
		 */
		"finalized": "finalized"
	};

	/**
	 * @class core.config.signal
	 * @enum {String}
	 * @private
	 */
	var SIGNAL = {
		/**
		 * Signal emitted first time an event handler is added.
		 */
		"setup": "sig/setup",
		/**
		 * Signal emitted each time an event handler is added.
		 */
		"add": "sig/add",
		/**
		 * Signal emitted each time an event handler is removed.
		 */
		"remove": "sig/remove",
		/**
		 * Signal emitted last time an event handler is removed.
		 */
		"teardown": "sig/teardown",
		/**
		 * Signal emitted when component initializes.
		 */
		"initialize": "sig/initialize",
		/**
		 * Signal emitted when component starts.
		 */
		"start": "sig/start",
		/**
		 * Signal emitted when component stops.
		 */
		"stop": "sig/stop",
		/**
		 * Signal emitted when component finalizes.
		 */
		"finalize": "sig/finalize",
		/**
		 * Signal emitted when component starts a task.
		 */
		"task": "sig/task"
	};

	/**
	 * Component configuration
	 * @class core.config
	 * @extends compose.config
	 * @private
	 * @alias feature.config
	 */

	return merge.call({}, config, {
		/**
		 * Component signals
		 * @cfg {core.config.signal}
		 * @protected
		 */
		"signal": SIGNAL,

		/**
		 * Component phases
		 * @cfg {core.config.phase}
		 * @protected
		 */
		"phase": PHASE
	}, module.config());
});