/* jshint node: true, esversion: 6 */
"use strict";

import _ from 'lodash';
import minimist from 'minimist';

const DEFAULT_OPTIONS = {
  storageDir: '.chaplain',
  suiteFile: 'chaplain.tests.js',
  interactive: process.stdout.isTTY,
  help: false,

  command: 'run',
  onlyTestsMatching: '^.*$'
};

export default function parseCliArguments(argv) {
  const raw = minimist(argv.slice(2));
  const options = {
    storageDir: getOpt(raw, 'd', 'storage-dir'),
    suiteFile: getOpt(raw, 'f', 'file'),
    interactive: boolOpt(getOpt(raw, 'i', 'interactive'), getOpt(raw, 'I', 'non-interactive')),
    help: getOpt(raw, 'h', 'help'),

    command: raw._[0],
    onlyTestsMatching: createRegexp(raw._.slice(1))
  };

  return _.defaults(options, DEFAULT_OPTIONS);
}

function getOpt(parsed, shortName, longName) {
  if (longName && parsed[longName])
    return parsed[longName];
  return parsed[shortName];
}

function boolOpt(yes, no) {
  if (no === true) return false;
  if (yes === true) return true;
  return undefined;
}

function createRegexp(patterns) {
  if (!patterns || !patterns.length)
    return undefined;

  patterns = patterns.map(p => `(${p})`);
  return '^' + patterns.join('|') + '$';
}
