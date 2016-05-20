/* jshint node: true, esversion: 6 */
"use strict";

import hiff from 'hiff';

module.exports = {
  plugin:   'format',
  mimeTypes: ['text/html'],

  create(config, test) {
    return {
      compare(actual, expected) {
        const result = hiff.compare(expected, actual);
        if (!result.different) {
          return [];
        } else {
          return result.changes.map(ch => {
            return {message: renderChange(ch)};
          });
        }
      }
    };
  }
};

function renderChange(change) {
  return [
    `In ${change.after.parentPath}:\n`,
    `\t${change.message}`
  ];
}
