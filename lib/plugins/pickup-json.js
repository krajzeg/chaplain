/* jshint node: true, esversion: 6 */
"use strict";

import _ from 'lodash';

// This plugins detects strings that are secretly JSON and
// marks them up as this content type.
module.exports = {
  plugin: 'pickup',

  create() {
    return {
      triggers(result) {
        // triggers every time we don't know the type
        // the transform might be a no-op if not JSON
        return (!result.keyProps.type);
      },

      transform(result) {
        if (typeof result.value == 'string') {
          return transformStringResult(result);
        } else {
          if (isJSONObject(result.value)) {
            result.keyProps.type = 'application/json';
          }
          return result;
        }
      }
    };

    function isJSONObject(obj) {
      if (!obj) return false; // no nulls and undefineds please
      if (typeof obj != 'object') return false; // no primitives please
      try {
        // check if it stringifies, i.e. no circular refs and stuff
        JSON.stringify(obj);
        return true;
      } catch(e) {
        // it doesn't - not JSON
        return false;
      }
    }

    function transformStringResult(result) {
      let parsed;
      try {
        parsed = JSON.parse(result.value);
      } catch (e) {
        // doesn't seem to be JSON, forget it
        return result;
      }
      // don't be overly eager - don't treat any number or the string 'false' as JSON
      // but objects and arrays are a pretty good bet
      if (parsed && typeof parsed == 'object') {
        result.keyProps.type = 'application/json';
        result.value = parsed;
      }
      return result;
    }
  }
};
