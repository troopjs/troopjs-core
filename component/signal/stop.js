/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
  "./start",
  "../../config",
  "when/when"
], function (start, config, when) {
  "use strict";

  var ARRAY_PUSH = Array.prototype.push;
  var PHASE = "phase";
  var STARTED = config.phase.started;
  var STOP = config.phase.stop;
  var STOPPED = config.phase.stopped;
  var SIG_STOP = config.signal.stop;

  /**
   * @class core.component.signal.stop
   * @implement core.component.signal
   * @mixin core.config
   * @static
   * @alias feature.signal
   * @private
   */

  /**
   * @method constructor
   * @inheritdoc
   * @localdoc Transitions the component {@link core.component.emitter#property-phase} to `stopped`
   */

  return function () {
    var me = this;
    var args = arguments;

    return when(start.apply(me, args), function (phase) {
      var _args;

      if (phase === STARTED) {
        // Let `me[PHASE]` be `"stop"`
        me[PHASE] = STOP;

        // Let `_args` be `[ SIG_STOP ]`
        // Push `args` on `_args`
        ARRAY_PUSH.apply(_args = [ SIG_STOP ], args);

        return me
          .emit.apply(me, _args)
          .then(function () {
            /*eslint no-return-assign:0*/
            // Let `me[PHASE]` be `STOPPED`
            return me[PHASE] = STOPPED;
          });
      }
      else {
        return phase;
      }
    });
  };
});
