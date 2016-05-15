#!/usr/bin/env node
/* jshint node: true, esversion: 6 */
"use strict";

import _ from 'lodash';
import {DEFAULT_CALLBACKS} from './cli/callbacks';

import setupChaplain from './index';

let config = null;
let command = null;

parseCliArguments()
  .then(parsed => {
    ({config, command} = parsed);
  })
  .then(() => readSuite(config))
  .then(suite => command(suite, config))
  .then(finishExecution)
  .catch(reportErrors);


function parseCliArguments() {
  return Promise.resolve({
    config: {
      suiteFile: 'chaplain.tests.js'
    },
    command: runSuite
  });
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
  let chaplain = setupChaplain(suite);

  console.log("+:-) Running Chaplain tests...");
  return chaplain.runSuite(DEFAULT_CALLBACKS)
    .then(results => {
      reportResults(results);
      return provideExitCode(results);
    });

  function reportResults({success, results}) {
    const testCount = _.size(results);

    if (success) {
      console.log(`+:-) All tests passed (${testCount} in total).`);
    } else {
      const statusCounts = _.countBy(results, 'status');
      console.error(`+:-( Some tests didn't pass - out of ${testCount} test(s), there were:`);
      _.each(statusCounts, (count, status) => {
        if (status != 'ok') {
          console.error(`      ${count} ${status} test(s)`);
        }
      });
    }
  }

  function provideExitCode({success}) {
    return success ? 0 : 1;
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
