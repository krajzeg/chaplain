/* jshint node: true, esversion: 6 */
"use strict";

module.exports = {
  plugin:   'format',
  mimeTypes: ['text/plain', '*'],

  create(config, test) {
    return {
      compare(actual, expected) {
        if (actual == expected) {
          return [];
        } else {
          return [{message: [
            'Text was different: ',
            {added: `"${actual}"`},
            ' != ',
            {removed: `"${expected}"`},
            '.'
          ]}];
        }
      }
    };
  }
};
