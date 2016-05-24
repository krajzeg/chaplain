/* jshint node: true, esversion: 6 */
"use strict";

import _ from 'lodash';
import minimist from 'minimist';
import chalk from 'chalk';

export default function parseCliArguments(argv, isTTY) {
  // defaults for this run (depend on whether we're on TTY)
  const defaultOptions = {
    storageDir: '.chaplain',
    suiteFile: 'chaplain.tests.js',
    interactive: isTTY,
    color: isTTY && chalk.supportsColor,
    help: false,
    command: 'run'
  };

  // actual commandline options
  const raw = minimist(argv.slice(2));
  const options = {
    storageDir: getOpt(raw, 'd', 'storage-dir'),
    suiteFile: getOpt(raw, 'f', 'file'),
    interactive: boolOpt(getOpt(raw, 'i', 'interactive'), getOpt(raw, 'I', 'non-interactive')),
    color: boolOpt(getOpt(raw, 'c', 'color'), getOpt(raw, 'C', 'no-color')),
    help: getOpt(raw, 'h', 'help'),

    command: raw._[0],
    onlyTestsMatching: createRegexp(raw._.slice(1))
  };

  // merge user-specified options with defaults
  return _.defaults(options, defaultOptions);
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
