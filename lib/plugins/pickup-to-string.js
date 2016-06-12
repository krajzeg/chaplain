/* jshint node: true, esversion: 6 */
"use strict";

// This is a last-resort pickup plugin - if nothing recognized what the answer was,
// it will be stringified and treated as plain text.
module.exports = {
  plugin: 'pickup',

  create() {
    return {
      triggers(result) {
        const noType = !result.keyProps.type;
        const nonStringText = result.keyProps.type == 'text/plain' && (typeof result.value != 'string');
        return noType || nonStringText;
      },

      transform(result) {
        result.keyProps.type = "text/plain";
        if (result.value && result.value.toString && result.value.toString != Object.prototype.toString) {
          result.value = result.value.toString();
        } else {
          result.value = require('util').inspect(result.value, {depth: null});
        }
        return result;
      }
    };
  }
};
