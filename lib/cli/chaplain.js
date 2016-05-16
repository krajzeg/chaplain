#!/usr/bin/env node
/* jshint node: true, esversion: 6 */
"use strict";

import _ from 'lodash';

import {RUN_CALLBACKS, BLESS_CALLBACKS} from './callbacks';
import parseCliArguments from './parse';
import setupOutput from './output';

import setupChaplain from '../index';

let config = null;
let command = null;
let output = null;

parseArguments()
  .then(parsed => {
    ({config, command} = parsed);
    output = setupOutput(config);
  })
  .then(() => readSuite(config))
  .then(suite => command(suite, config))
  .then(finishExecution)
  .catch(reportErrors);


function parseArguments() {
  const config = parseCliArguments(process.argv);
  const commandFns = {'run': runSuite, 'bless': blessSuite};
  const command = commandFns[config.command];
  if (!command) {
    console.error(`Unknown command: ${config.command}`);
    process.exit(2);
  }

  return Promise.resolve({config, command});
}

function readSuite(cfg) {
  const path = require('path');
  return Promise.resolve().then(() => {
    try {
      return require(path.join(process.cwd(), cfg.suiteFile))();
    } catch(err) {
      throw {
        exitCode: 2,
        message: "Had a problem parsing your test suite:\n" + (err.stack || err)
      };
    }
  });
}

function runSuite(suite, cfg) {
  let chaplain = setupChaplain(suite, cfg);

  output.log({happy: "Running Chaplain tests..."});
  return chaplain.runSuite(RUN_CALLBACKS)
    .then(results => {
      reportResults(results);
      return provideExitCode(results);
    });

  function reportResults({success, results}) {
    const testCount = _.size(results);

    if (success) {
      output.log("\n", {happy: `All tests passed (${testCount} in total).`});
    } else {
      const statusCounts = _.countBy(results, 'status');
      output.error("\n", {sad: `Some tests didn't pass - out of ${testCount} test(s), there were:`});
      _.each(statusCounts, (count, status) => {
        if (status != 'ok') {
          output.error(['      ', {highlighted: `${count} ${status}`}, ' test(s)']);
        }
      });
    }
  }

  function provideExitCode({success}) {
    return success ? 0 : 1;
  }
}

function blessSuite(suite, cfg) {
  let chaplain = setupChaplain(suite, cfg);

  output.log({happy: 'Blessing tests...'});
  return chaplain.blessSuite(BLESS_CALLBACKS)
    .then(blessedTests => {
      reportResults(blessedTests);
      return provideExitCode(blessedTests);
    });

  function reportResults(blessedTests) {
    if (!blessedTests.length) {
      output.error("\n", {sad: 'Found no matching test(s) to bless.'});
    } else {
      output.log("\n", {happy: `Blessed ${blessedTests.length} test(s).`});
    }
  }

  function provideExitCode(blessedTests) {
    return (blessedTests.length) ? 0 : 2;
  }
}

function finishExecution(exitCode) {
  process.exit(exitCode);
}

function reportErrors(err) {
  if (err.exitCode) {
    console.error("+:-( " + err.message);
    process.exit(err.exitCode);
  } else {
    console.error("+:-( Unexpected error:");
    console.error(err.stack || err);
    process.exit(2);
  }
}
