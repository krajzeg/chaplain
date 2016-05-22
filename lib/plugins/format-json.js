/* jshint node: true, esversion: 6 */
"use strict";

import _ from 'lodash';
import jdp from 'jsondiffpatch';
import {inspect} from 'util';

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
            "This is how your JSON changed (only changed properties shown):\n",
            renderJDPDelta(delta)
          ]}];
        }
      },

      formatOutput(output) {
        // pretty-print the JSON
        return JSON.stringify(JSON.parse(output), null, 2);
      }
    };
  }
};

function renderJDPDelta(delta, indentLevel = 0) {
  let rendered = _.map(delta, (d, property) => {
    // skip special jdp properties
    if (property == '_t') {
      return;
    }

    // arrive at the right printable property name
    let propPrefix = property.replace(/^_/, '');
    if (/^\d+$/.test(propPrefix)) {
      // numeric indices get rendered as [n]
      propPrefix = `[${propPrefix}]: `;
    } else if (!/^[a-zA-Z0-9_]+$/.test(propPrefix)) {
      // quotes shown only when needed
      propPrefix = `"${propPrefix}": `;
    } else {
      propPrefix = `${propPrefix}: `;
    }

    // arrays are atomic changes
    if (d instanceof Array) {
      if (d.length == 1) {
        // property added
        return [
          indent(2), '+', propPrefix,
          {added: JSON.stringify(d[0])},
          "\n"
        ];
      } else if (d.length == 2) {
        // property changed
        return [
          indent(2), propPrefix,
          {removed: JSON.stringify(d[0])},
          ' -> ',
          {added: JSON.stringify(d[1])},
          "\n"
        ];
      } else if (d.length == 3) {
        if (d[2] == 0) {
          // property removed
          return [
            indent(2), '-', propPrefix,
            {removed: JSON.stringify(d[0])},
            "\n"
          ];
        } else {
          throw new Error("Unable to understand this delta: " + inspect(d));
        }
      } else {
        throw new Error("Unable to understand this delta: " + inspect(d));
      }
    } else if (typeof d == 'object') {
      // objects are nested changes
      return [].concat(
        [indent(2), propPrefix],
        renderJDPDelta(d, indentLevel+2)
      );
    } else {
      throw new Error("Unable to understand this delta: " + inspect(d));
    }
  });

  // remove undefined and nulls
  rendered = rendered.filter(msg => !!msg);

  // add braces
  const open = delta._t ? '[' : '{',
    close = delta._t ? ']' : '}';
  rendered = [].concat([open, "\n"], rendered, [indent(), close, "\n"]);
  return rendered;

  function indent(additional = 0) {
    return " ".repeat(indentLevel + additional);
  }
}

// An implementation of the jsondiffpatch object hash
// that will let us produce at least somewhat sensible
// results for arrays of objects.
function objectHash(o) {
  return JSON.stringify(o);
}
