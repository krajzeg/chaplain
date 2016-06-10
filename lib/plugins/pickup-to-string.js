/* jshint node: true, esversion: 6 */
"use strict";

// This is a last-resort pickup plugin - if nothing recognized what the answer was,
// it will be stringified and treated as plain text.
module.exports = {
  plugin: 'pickup',

  create() {
    return {
      triggers(result) {
        return (!result.keyProps.type);
      },

      transform(result) {
        result.keyProps.type = "text/plain";
        if (result.value) {
          result.value = result.value.toString();
        } else {
          result.value = require('util').inspect(result.value);
        }
        return result;
      }
    };
  }
};
