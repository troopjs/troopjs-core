/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
  "./initialize",
  "../../config",
  "when/when"
], function (initialize, config, when) {
  "use strict";

  var ARRAY_PUSH = Array.prototype.push;
  var PHASE = "phase";
  var INITIALIZED = config.phase.initialized;
  var START = config.phase.start;
  var STARTED = config.phase.started;
  var SIG_START = config.signal.start;

  /**
   * @class core.component.signal.start
   * @implement core.component.signal
   * @mixin core.config
   * @static
   * @alias feature.signal
   * @private
   */

  /**
   * @method constructor
   * @inheritdoc
   * @localdoc Transitions the component {@link core.component.emitter#property-phase} to `started`
   */

  return function () {
    var me = this;
    var args = arguments;

    return when(initialize.apply(me, args), function (phase) {
      var _args;

      if (phase === INITIALIZED) {
        // Let `me[PHASE]` be `START`
        me[PHASE] = START;

        // Let `_args` be `[ SIG_START ]`
        // Push `args` on `_args`
        ARRAY_PUSH.apply(_args = [ SIG_START ], args);

        return me
          .emit.apply(me, _args)
          .then(function () {
            /*eslint no-return-assign:0*/

            // Let `me[PHASE]` be `STARTED`
            return me[PHASE] = STARTED;
          });
      }
      else {
        return phase;
      }
    });
  };
});
