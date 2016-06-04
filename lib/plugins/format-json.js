/* jshint node: true, esversion: 6 */
"use strict";

import _ from 'lodash';
import jdp from 'jsondiffpatch';
import jsonpath from 'jsonpath';
import {inspect} from 'util';
import {UserFacingError} from '../errors';

module.exports = {
  plugin:   'format',
  mimeTypes: ['application/json'],

  create(config, test) {
    // extract configuration
    const ignoredPaths = [].concat(_.get(config, 'json.ignore', []), _.get(test, 'json.ignore', []))
      .map(preprocessJSONPath);
    ignoredPaths.forEach(checkJSONPath);

    // create the diff object
    const jsonDiff = jdp.create({
      objectHash,
      textDiff: {minLength: Number.MAX_VALUE}, // no text diffs for the first version, please
      array: {detectMove: false} // no array moves also for the first thing
    });

    // return the implementation
    return {
      compare(actual, expected) {
        const [actualJson, expectedJson] = [actual, expected].map(json => {
          json = coerceToObject(json);
          json = applyIgnores(json, ignoredPaths);
          return json;
        });

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
        return JSON.stringify(coerceToObject(output), null, 2);
      }
    };
  }
};

// We don't require our paths to start with '$.', to support intuitive syntax like
// ignore: 'this.one.property'
function preprocessJSONPath(path) {
  if (!path.startsWith('$')) {
    const prefix = (/^[A-Za-z_]/.test(path)) ? '$.' : '$';
    return prefix + path;
  } else {
    return path;
  }
}

// Checks if a JSON path parses properly, throws user-friendly exception if not
function checkJSONPath(path) {
  try {
    jsonpath.parse(path);
  } catch(err) {
    throw new UserFacingError([
      "The JSON path you specified: ",
      {highlighted: `'${path}'`},
      " failed to parse:\n",
      err.message
    ]);
  }
}

function applyIgnores(content, ignoredPaths = []) {
  ignoredPaths.forEach(path => {
    const matches = jsonpath.paths(content, path)
      .map(m => m.slice(1)); // remove the initial '$'
    matches.forEach(match => {
      _.set(content, match, "<ignored>");
    });
  });

  return content;
}

function renderJDPDelta(delta, indentLevel = 0) {
  let rendered = _.map(delta, (d, property) => {
    // skip special jdp properties
    if (property == '_t') {
      return;
    }

    // arrive at the right printable property name
    let propPrefix = property;
    if (/^_\d+$/.test(propPrefix))
      propPrefix = propPrefix.substring(1);
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

// Will coerce any string or object into an object,
// parsing with JSON.parse() if necessary.
function coerceToObject(json) {
  if (typeof json == 'string') {
    try {
      return JSON.parse(json);
    } catch(err) {
      throw new UserFacingError([
        "Your output was supposed to be JSON, but it doesn't parse:\n",
        err.message
      ]);
    }
  } else {
    return json;
  }
}
