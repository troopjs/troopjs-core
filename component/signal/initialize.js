/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
  "../../config",
  "when/when"
], function (config, when) {
  "use strict";

  var UNDEFINED;
  var ARRAY_PUSH = Array.prototype.push;
  var PHASE = "phase";
  var INITIALIZE = config.phase.initialize;
  var INITIALIZED = config.phase.initialized;
  var SIG_INITIALIZE = config.signal.initialize;

  /**
   * @class core.component.signal.initialize
   * @implement core.component.signal
   * @mixin core.config
   * @static
   * @alias feature.signal
   * @private
   */

  /**
   * @method constructor
   * @inheritdoc
   * @localdoc Transitions the component {@link core.component.emitter#property-phase} to `initialized`
   */

  return function () {
    var me = this;
    var args = arguments;

    return when(me[PHASE], function (phase) {
      var _args;

      if (phase === UNDEFINED) {
        // Let `me[PHASE]` be `INITIALIZE`
        me[PHASE] = INITIALIZE;

        // Let `_args` be `[ SIG_INITIALIZE ]`
        // Push `args` on `_args`
        ARRAY_PUSH.apply(_args = [ SIG_INITIALIZE ], args);

        return me
          .emit.apply(me, _args)
          .then(function () {
            /*eslint no-return-assign:0*/

            // Let `me[PHASE]` be `INITIALIZED`
            return me[PHASE] = INITIALIZED;
          });
      }
      else {
        return phase;
      }
    });
  };
});
