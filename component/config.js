/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"module",
	"mu-merge"
], function (module, merge) {
	"use strict";

	/**
	 * Component configuration
	 * @class core.component.config
	 * @protected
	 * @alias feature.config
	 */

	return merge.call({
		/**
		 * @cfg signal Signal related configuration.
		 * @cfg {String} signal.initialize=initialize Signal emitted when component initializes.
		 * @cfg {String} signal.start=start Signal emitted when component starts.
		 * @cfg {String} signal.stop=stop Signal emitted when component stops.
		 * @cfg {String} signal.finalize=finalize Signal emitted when component finalizes.
		 */
		"signal": {
			"initialize": "initialize",
			"start": "start",
			"stop": "stop",
			"finalize": "finalize"
		},

		/**
		 * @cfg phase Phase related configuration.
		 * @cfg {RegExp} phase.skip=^(?:initi|fin)alized?$ Pattern of protected phases.
		 * @cfg {String} phase.initialize=initialize Phase while component is initializing.
		 * @cfg {String} phase.initialized=initialized Phase when component is initialized.
		 * @cfg {String} phase.start=start Phase while component is starting.
		 * @cfg {String} phase.started=started Phase when component is started.
		 * @cfg {String} phase.stop=stop Phase while component is stopping.
		 * @cfg {String} phase.stopped=stopped Phase when component is stopped.
		 * @cfg {String} phase.finalize=finalize Phase while component is finalizing.
		 * @cfg {String} phase.finalized=finalized Phase when component is finalized.
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