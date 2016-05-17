#!/usr/bin/env node
/* jshint node: true, esversion: 6 */
"use strict";

import _ from 'lodash';
import inquirer from 'inquirer';

import parseCliArguments from './parse';
import readSuite from './read-suite';
import setupOutput from './output';
import setupCallbacks from './callbacks';
import reportTestResult from './result-reporting';
import {outputUsage, outputHelp} from './usage';
import {UserFacingError} from '../errors';

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
  .then(() => validateConfig(config, command))
  .then(() => readSuite(config.suiteFile))
  .then(suite => command(suite, config))
  .then(finishExecution)
  .catch(reportErrors);


function parseArguments() {
  const config = parseCliArguments(process.argv);

  // if we're asked for help, just display it and terminate here
  if (config.help) {
    outputHelp(setupOutput(config));
    process.exit(0);
  }

  // figure out what command to run
  const commandFns = {'run': runSuite, 'bless': blessSuite};
  const command = commandFns[config.command];

  return Promise.resolve({config, command});
}

function validateConfig(config, command) {
  if (!command) {
    output.error({sad: `Unknown command: ${config.command}\n`});
    outputUsage(output);
    process.exit(2);
  }
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

    output.clear();
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
    if (['error', 'exception'].indexOf(result.status) >= 0) {
      // errors and exceptions can't be accepted as valid
      return Promise.resolve('n');
    } else {
      // an acceptable test, ask the user what to do
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
  if (!output) output = setupOutput({});
  if (err.code == 'EUSERFACING') {
    output.error({sad: err.message});
  } else {
    output.error({sad: "Unexpected error:"});
    output.error(err.stack);
    output.error({sad: "Please report this issue here: "},
      {highlighted: "https://github.com/krajzeg/chaplain/issues"});
  }
  process.exit(2);
}
