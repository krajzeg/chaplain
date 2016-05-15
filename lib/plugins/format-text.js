/* jshint node: true, esversion: 6 */
"use strict";

module.exports = {
  plugin:   'format',
  mimeTypes: ['text/plain', '*'],

  create(config, test) {
    return {
      compare(expected, actual) {
        return [];
      }
    };
  }
};
