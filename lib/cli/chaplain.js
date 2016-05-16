#!/usr/bin/env node
/* jshint node: true, esversion: 6 */
"use strict";

import _ from 'lodash';
import inquirer from 'inquirer';

import parseCliArguments from './parse';
import setupOutput from './output';
import setupCallbacks from './callbacks';
import reportTestResult from './result-reporting';

import setupChaplain from '../index';

let config = null;
let command = null;
let output = null;
let callbacks = null;

parseArguments()
  .then(parsed => {
    ({config, command} = parsed);
    output = setupOutput(config);
    callbacks = setupCallbacks(output);
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
  const chaplain = setupChaplain(suite, cfg);
  const report = cfg.interactive ? interactiveReport : nonInteractiveReport;
  let alreadyQuit = false;
  let results = null;

  output.logNoNewline({happy: "Running Chaplain tests "});
  return chaplain.runSuite(callbacks.run)
    .then(r => results = r)
    .then(() => reportResults(results))
    .then(() => provideExitCode(results));

  function reportResults({success, results}) {
    const testCount = _.size(results);

    output.log('');
    if (success) {
      output.log({happy: `All tests passed (${testCount} in total).`});
    } else {
      const reports = _(results).pairs().filter(([name, result]) => result.status != 'ok').value();
      const blessings = {};
      const reportEverything = _.reduce(reports, (promise, [testName, result]) => {
          return promise
            .then(() => report(result, testName))
            .then(blessed => blessings[testName] = blessed);
      }, Promise.resolve());

      return reportEverything.then(() => {
        if (_.every(blessings, blessed => blessed)) {
          output.log("\n",
            {happy: `There were changes, but you blessed all of them, so you're set!\n`},
            {happy: `Remember to add the changed .chaplain/... files to your next commit.`}
          );
        } else {
          const unblessedResults = _.filter(results, (result, testName) => {
            return (result.status != 'ok') && (!blessings[testName]);
          });
          const statusCounts = _.countBy(unblessedResults, 'status');

          output.error("\n", {sad: `Some failing tests remain:`});
          _.each(statusCounts, (count, status) => {
              output.error({sad: ` ${count} ${status} test(s)`});
          });
        }
      });
    }
  }

  function nonInteractiveReport(result, testName) {
    reportTestResult(testName, result, output);
    return Promise.resolve(false);
  }

  function interactiveReport(result, testName) {
    if (alreadyQuit)
      return Promise.resolve();

    reportTestResult(testName, result, output);

    output.log('');
    return askForBlessing(result, testName).then(answer => {
      if (answer == 'q') {
        alreadyQuit = true;
        return false;
      } else if (answer == 'y') {
        return chaplain.blessTest(testName, result.actual).then(() => true);
      } else {
        return false;
      }
    });
  }

  function askForBlessing(result, testName) {
    if (['new', 'changed'].indexOf(result.status) == -1) {
      return Promise.resolve('n');
    } else {
      return inquirer.prompt([{
        type: 'expand',
        message: 'Should I bless that as the new correct output?',
        name: 'bless',
        'default': 1,
        choices: [
          {key: 'y', name: "Yes, it's correct", value: 'y'},
          {key: 'n', name: "No, this is incorrect", value: 'n'},
          {key: 'q', name: "Quit, I've seen enough", value: 'q'}
        ]
      }]).then(answers => answers.bless);
    }
  }

  function provideExitCode({success}) {
    return success ? 0 : 1;
  }
}



function blessSuite(suite, cfg) {
  let chaplain = setupChaplain(suite, cfg);

  output.log({happy: 'Blessing tests...'});
  return chaplain.blessSuite(callbacks.bless)
    .then(blessedTests => {
      reportResults(blessedTests);
      return provideExitCode(blessedTests);
    });

  function reportResults(blessedTests) {
    if (!blessedTests.length) {
      output.error({sad: 'Found no matching test(s) to bless.'});
    } else {
      output.log({happy: `Blessed ${blessedTests.length} test(s).`});
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
