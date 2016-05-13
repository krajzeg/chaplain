#!/usr/bin/env node
/* jshint node: true, esversion: 6 */
"use strict";

import {run} from './index';

let config = null;
let command = null;
let suite = null;

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
        message: "Had a problem parsing your Chaplain config:\n" + (err.stack || err)
      };
    }
  });
}

function runSuite(suite, cfg) {
  return run(suite, cfg)
    .then((results) => {
      console.log("+(:-) Chaplain: always happy for now.");
      return 0;
    });
}

function finishExecution(exitCode) {
  process.exit(exitCode);
}

function reportErrors(err) {
  if (err.exitCode) {
    console.error("+(:-( " + err.message);
    process.exit(err.exitCode);
  } else {
    console.error("+(:-( Unexpected error:");
    console.error(err.stack || err);
    process.exit(2);
  }
}
