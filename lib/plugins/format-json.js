/* jshint node: true, esversion: 6 */
"use strict";

import jdp from 'jsondiffpatch';

module.exports = {
  plugin:   'format',
  mimeTypes: ['application/json'],

  create(config, test) {
    const jsonDiff = jdp.create({
      objectHash,
      textDiff: {minLength: Number.MAX_VALUE}, // no text diffs for the first version, please
      array: {detectMove: false} // no array moves also for the first thing
    });

    return {
      compare(actual, expected) {
        const [actualJson, expectedJson] = [actual, expected].map(JSON.parse);

        const delta = jsonDiff.diff(expectedJson, actualJson);
        if (delta === undefined) {
          return [];
        } else {
          return [{message: [
            "These were the changes in your JSON:\n",
            renderJDPDelta(delta)
          ]}];
        }
      }
    };
  }
};

function renderJDPDelta(delta) {
  return JSON.stringify(delta, null, 2);
}

// An implementation of the jsondiffpatch object hash
// that will let us produce at least somewhat sensible
// results for arrays of objects.
function objectHash(o) {
  return JSON.stringify(o);
}
