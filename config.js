/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
  "module",
  "troopjs-compose/config",
  "mu-emitter/config",
  "mu-merge/main"
], function (module, config, emitterConfig, merge) {
  "use strict";

  /**
   * @class core.config.emitter
   * @enum {String}
   * @private
   */
  /**
   * @property handlers Property name for `handlers`
   */
  /**
   * @property emitter Property name for `emitter`
   */
  /**
   * @property type Property name for `type`
   */
  /**
   * @property callback Property name for `callback`
   */
  /**
   * @property data Property name for `data`
   */
  /**
   * @property scope Property name for `scope`
   */
  /**
   * @property executor Property name for `executor`
   */
  /**
   * @property head Property name for `head`
   */
  /**
   * @property tail Property name for `tail`
   */
  /**
   * @property next Property name for `next`
   */
  /**
   * @property count Property name for `count`
   */
  /**
   * @property limit Property name for `limit`
   */
  /**
   * @property on Property name for `on`
   */
  /**
   * @property off Property name for `off`
   */

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
     * Signal emitted before each time an event handler is added.
     */
    "add": "sig/add",
    /**
     * Signal emitted each time an event handler is added.
     */
    "added": "sig/added",
    /**
     * Signal emitted before each time an event handler is removed.
     */
    "remove": "sig/remove",
    /**
     * Signal emitted each time an event handler is removed.
     */
    "removed": "sig/removed",
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
     * Signal emitted during registration.
     */
    "register": "sig/register",
    /**
     * Signal emitted during un-registeration.
     */
    "unregister": "sig/unregister",
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
    "phase": PHASE,

    /**
     * Emitter properties
     * @cfg {core.config.emitter}
     * @protected
     */
    "emitter": emitterConfig
  }, module.config());
});
