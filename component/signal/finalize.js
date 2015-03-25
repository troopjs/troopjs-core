/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
  "./stop",
  "../../config",
  "when/when"
], function (stop, config, when) {
  "use strict";

  var ARRAY_PUSH = Array.prototype.push;
  var PHASE = "phase";
  var STOPPED = config.phase.stopped;
  var FINALIZE = config.phase.finalize;
  var FINALIZED = config.phase.finalized;
  var SIG_FINALIZE = config.signal.finalize;

  /**
   * @class core.component.signal.finalize
   * @implement core.component.signal
   * @mixin core.config
   * @static
   * @alias feature.signal
   * @private
   */

  /**
   * @method constructor
   * @inheritdoc
   * @localdoc Transitions the component {@link core.component.emitter#property-phase} to `finalized`
   */
  return function () {
    var me = this;
    var args = arguments;

    return when(stop.apply(me, args), function (phase) {
      var _args;

      if (phase === STOPPED) {
        // Let `me[PHASE]` be `FINALIZE`
        me[PHASE] = FINALIZE;

        // Let `_args` be `[ SIG_FINALIZE ]`
        // Push `args` on `_args`
        ARRAY_PUSH.apply(_args = [ SIG_FINALIZE ], args);

        return me
          .emit.apply(me, _args)
          .then(function () {
            /*eslint no-return-assign:0*/

            // Let `me[PHASE]` be `FINALIZED`
            return me[PHASE] = FINALIZED;
          });
      }
      else {
        return phase;
      }
    });
  };
});
