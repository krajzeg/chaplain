/* jshint node: true, esversion: 6 */
"use strict";

import _ from 'lodash';
const JSDiff = require('diff');

module.exports = {
  plugin: 'format',
  mimeTypes: ['text/plain', '*'],

  create(config, test) {
    const ignoreLines = [].concat(
      _.get(config, 'text.ignoreLines', []),
      _.get(test, 'text.ignoreLines', [])
    );

    return {compare};

    function compare(actual, expected) {
      [expected, actual] = [expected, actual].map(applyIgnores);
      const diff = JSDiff.diffWords(expected, actual);

      // only one part in diff means no changes
      if (diff.length == 1) {
        return [];
      }
      // anything else means we have work to do
      const changes = collectChanges(diff);
      return changes.map(c => ({message: renderChange(c)}));
    }

    function applyIgnores(string) {
      // apply line ignores
      ignoreLines.forEach(pattern => {
        const regex = new RegExp(`^${pattern}$`, 'mg');
        string = string.replace(regex, (match) => '<ignored>');
      });

      // collapse subsequent ignores into a single one
      string = string.replace(/<ignored>(\s+<ignored>)+/g, '<ignored>');

      // done!
      return string;
    }
  }
};

function collectChanges(diff) {
  let changes = [], line = 1, change = null;
  _.each(diff, (part, index) => {
    const unchanged = !part.removed && !part.added;
    if (unchanged) {
      if (change) {
        change.after = part;
        changes.push(change);
        change = null;
      }
      line += countNewLinesIn(part.value);
    } else {
      if (part.added) {
        line += countNewLinesIn(part.value);
      }
      if (change) {
        change.parts.push(part);
      } else {
        change = {
          line,
          before: diff[index - 1],
          parts: [part]
        };
      }
    }
  });

  // fix-up if a change was the last element
  if (change) {
    change.after = null;
    changes.push(change);
  }

  return changes;
}

function countNewLinesIn(str) {
  return (str.match(/\n/g) || []).length;
}

function renderChange(change) {
  let before = [], after = [];

  const descriptor = [{highlighted: `In line ${change.line}:\n`}];

  if (change.before) {
    // at least one line of context, if possible
    const beforeLines = _.takeRight(change.before.value.split("\n"), 2);
    before = beforeLines.map((line, index) => {
      return (index != beforeLines.length - 1) ? line + "\n" : line;
    });
  }

  const changed = change.parts.map(part => {
    if (part.removed)
      return {removed: part.value};
    if (part.added)
      return {added: part.value};
  });

  if (change.after) {
    // at least one line of context, if possible
    const afterLines = _.take(change.after.value.split("\n"), 2);
    after = afterLines.map((line, index) => {
      return (index != afterLines.length - 1) ? line + "\n" : line;
    });
  }

  return [].concat(descriptor, before, changed, after);
}
