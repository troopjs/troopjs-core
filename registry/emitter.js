/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
  "../emitter/composition",
  "../config",
  "../component/executor"
], function (Emitter, config, executor) {
  "use strict";

  /**
   * A light weight implementation to register key/value pairs by key and index
   * @class core.registry.emitter
   * @extend core.emitter.composition
   */

  var LENGTH = "length";
  var INDEX = "index";
  var OBJECT_TOSTRING = Object.prototype.toString;
  var TOSTRING_REGEXP = "[object RegExp]";
  var SIG_REGISTER = config.signal.register;
  var SIG_UNREGISTER = config.signal.unregister;
  var EXECUTOR = config.emitter.executor;

  /**
   * Register signal
   * @event sig/register
   * @localdoc Triggered when something is registered via {@link #register}.
   * @since 3.0
   * @param {String} key
   * @param {*} value
   */

  /**
   * Un-register signal
   * @event sig/unregister
   * @localdoc Triggered when something is un-registered via {@link #unregister}.
   * @since 3.0
   * @param {String} key
   * @param {*} value
   */

  /**
   * @method constructor
   * @inheritdoc
   */
  return Emitter.extend(function () {
    /**
     * Registry index
     * @private
     * @readonly
     */
    this[INDEX] = {};
  }, function (key, value) {
    var me = this;
    me[key] = value;
    return me;
  }.call({
    "displayName": "core/registry/emitter",

    /**
     * Gets value by key
     * @param {String|RegExp} [key] key to filter by
     *  - If `String` get value exactly registered for key.
     *  - If `RegExp` get value where key matches.
     *  - If not provided all values registered are returned
     * @return {*|*[]} result(s)
     */
    "get": function (key) {
      var index = this[INDEX];
      var result;

      if (arguments[LENGTH] === 0) {
        result = Object
          .keys(index)
          .map(function (_key) {
            return index[_key];
          });
      }
      else if (OBJECT_TOSTRING.call(key) === TOSTRING_REGEXP) {
        result = Object
          .keys(index)
          .filter(function (_key) {
            return key.test(_key);
          }).map(function (_key) {
            return index[_key];
          });
      }
      else {
        result = index[key];
      }

      return result;
    },

    /**
     * Registers value with key
     * @param {String} key Key
     * @param {*} value Value
     * @fires sig/register
     * @return {*} value registered
     */
    "register": function (key, value) {
      var me = this;
      var index = me[INDEX];

      if (index[key] !== value) {

        if (index.hasOwnProperty(key)) {
          me.unregister(key);
        }

        me.emit(SIG_REGISTER, key, index[key] = value);
      }

      return value;
    },

    /**
     * Un-registers key
     * @param {String} key Key
     * @fires sig/unregister
     * @return {*} value unregistered
     */
    "unregister": function (key) {
      var me = this;
      var index = me[INDEX];
      var value;

      if (index.hasOwnProperty(key)) {

        value = index[key];

        if (delete index[key]) {
          me.emit(SIG_UNREGISTER, key, value);
        }
      }

      return value;
    }
  }, EXECUTOR, executor));
});
