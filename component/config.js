/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"module",
	"troopjs-compose/mixin/config",
	"mu-merge"
], function (module, config, merge) {
	"use strict";

	/**
	 * Component configuration
	 * @class core.component.config
	 * @extends compose.mixin.config
	 * @protected
	 * @alias feature.config
	 */

	return merge.call(config, {
		"signal": {
			/**
			 * @cfg {Object} signal Signal related configuration.
			 * @cfg {String} signal.setup=setup Signal emitted first time an event handler is added.
			 * @cfg {String} signal.add=add Signal emitted each time an event handler is added.
			 * @cfg {String} signal.remove=remove Signal emitted each time an event handler is removed.
			 * @cfg {String} signal.initialize=teardown Signal emitted last time an event handler is removed.
			 * @cfg {String} signal.initialize=initialize Signal emitted when component initializes.
			 * @cfg {String} signal.start=start Signal emitted when component starts.
			 * @cfg {String} signal.stop=stop Signal emitted when component stops.
			 * @cfg {String} signal.finalize=finalize Signal emitted when component finalizes.
			 * @cfg {String} signal.task=task Signal emitted when component starts a task.
			 * @protected
			 */
			"setup": "setup",
			"add": "add",
			"remove": "remove",
			"teardown": "teardown",
			"initialize": "initialize",
			"start": "start",
			"stop": "stop",
			"finalize": "finalize",
			"task": "task"
		},

		/**
		 * @cfg {Object} phase Phase related configuration.
		 * @cfg {RegExp} phase.skip=^(?:initi|fin)alized?$ Pattern of protected phases.
		 * @cfg {String} phase.initialize=initialize Phase while component is initializing.
		 * @cfg {String} phase.initialized=initialized Phase when component is initialized.
		 * @cfg {String} phase.start=start Phase while component is starting.
		 * @cfg {String} phase.started=started Phase when component is started.
		 * @cfg {String} phase.stop=stop Phase while component is stopping.
		 * @cfg {String} phase.stopped=stopped Phase when component is stopped.
		 * @cfg {String} phase.finalize=finalize Phase while component is finalizing.
		 * @cfg {String} phase.finalized=finalized Phase when component is finalized.
		 * @protected
		 */
		"phase": {
			"skip" : /^(?:initi|fin)alized?$/,
			"initialize": "initialize",
			"initialized": "initialized",
			"start": "start",
			"started": "started",
			"stop": "stop",
			"stopped": "stopped",
			"finalize": "finalize",
			"finalized": "finalized"
		}
	}, module.config());
});