/* jshint node: true, esversion: 6 */
"use strict";

import _ from 'lodash';

import parseCliArguments from './parse-cli-arguments';
import readTestfile from './read-testfile';
import setupOutput from './output';
import setupCallbacks from './callbacks';
import reportTestResult from './result-reporting';
import {outputUsage, outputHelp} from './usage';
import {UserFacingError, TerminationError} from '../errors';

import setupChaplain from '../index';

// The entire CLI lives in the scope of this function.
// Inside, all references to the outside world will refer
// to whatever parameters were passed in.
export default function cliEngine({argv, fs, write, writeError, prompt, isTTY}) {
  let config = null;
  let command = null;
  let output = null;
  let callbacks = null;

  return { run };

  // =========================================

  function run() {
    return Promise.resolve()
      .then(parseArguments)
      .then(parsed => {
        ({config, command} = parsed);
        output = setupOutput(config, write, writeError);
        callbacks = setupCallbacks(output);
      })
      .then(() => validateConfig(config, command))
      .then(() => readTestfile(fs, config.suiteFile))
      .then(suites => command(suites, config))
      .catch(reportErrors);
  }

  function parseArguments() {
    const config = parseCliArguments(argv, isTTY);
    // if we're asked for help, just display it and terminate here
    if (config.help) {
      outputHelp(setupOutput(config, write, writeError));
      throw new TerminationError(0, "Help displayed.");
    }
    // figure out what command to run
    const commandFns = {'run': runAll, 'bless': blessAll};
    const command = commandFns[config.command];
    // put the right filesystem for use by the library part
    config.fs = fs;
    // done!
    return Promise.resolve({config, command});
  }

  function validateConfig(config, command) {
    // no command?
    if (!command) {
      output.error({sad: `Unknown command: ${config.command}\n`});
      outputUsage(output);
      throw new TerminationError(2, "Unknown command.");
    }
    // check for -ffile usage (not supported by minimist)
    if (config.storageDir === true || config.suiteFile === true) {
      throw new UserFacingError([
        "Please specify filename arguments with a space, e.g. ",
        {highlighted: "-d mydir"},
        " not ",
        {bad: "-dmydir"},
        "."
      ]);
    }
  }

  function runAll(suites, cfg) {
    const report = cfg.interactive ? interactiveReport : nonInteractiveReport;
    let alreadyQuit = false;

    output.logNoNewline({happy: "Running Chaplain tests "});

    const runAllSuitesAndMergeResults = Promise.all(suites.map(suite => {
      const chaplain = setupChaplain(suite, cfg);
      // we extend each runSuite result with the chaplain object that was used
      // to obtain it - for future reference
      return chaplain.runSuite(callbacks.run)
        .then(result => _.extend(result, {chaplain}));

    })).then(resultObjects => {
      // merge results from multiple suites
      const merged = {
        // everything succeeds if all suits succeeded
        success: _.all(resultObjects, ro => ro.success),
        // merge the 'results' map for all the tests
        results: _.extend.apply(null, resultObjects.map(ro => {
          // add a chaplain reference to each of the test results
          // so we can access it when working on results
          const testResults = ro.results;
          _.each(testResults, result => _.extend(result, {chaplain: ro.chaplain}));
          return testResults;
        }))
      };
      return merged;
    });

    let results = null;
    return runAllSuitesAndMergeResults
      .then(r => results = r)
      .then(() => reportResults(results))
      .then(() => provideExitCode(results));

    // ===

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
            .then(() => report(result))
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

    function nonInteractiveReport(result) {
      reportTestResult(result, output);
      return Promise.resolve(false);
    }

    function interactiveReport(result) {
      if (alreadyQuit)
        return Promise.resolve();

      output.clear();
      reportTestResult(result, output);
      output.log('');

      return askForBlessing(result).then(answer => {
        if (answer == 'q') {
          alreadyQuit = true;
          return false;
        } else if (answer == 'y') {
          const {chaplain} = result; // use the right chaplain instance
          return chaplain.blessTest(result).then(() => true);
        } else {
          return false;
        }
      });
    }

    function askForBlessing(result) {
      if (['error', 'exception'].indexOf(result.status) >= 0) {
        // errors and exceptions can't be accepted as valid
        // but we still want to wait for the user to acknowledge them
        // or choose to quit
        return prompt([{
          type: 'expand',
          message: 'Should I proceed with the rest of your test results?',
          name: 'bless',
          'default': 1,
          choices: [
            {key: 'y', name: "Yes, proceed", value: 'n'},
            {key: 'n', name: "No, I've seen enough", value: 'q'}
          ]
        }]).then(({bless}) => bless);
      } else {
        // an acceptable test, ask the user what to do
        return prompt([{
          type: 'expand',
          message: 'Should I bless that as the new correct output?',
          name: 'bless',
          'default': 1,
          choices: [
            {key: 'y', name: "Yes, it's correct", value: 'y'},
            {key: 'n', name: "No, this is incorrect", value: 'n'},
            {key: 'q', name: "Quit, I've seen enough", value: 'q'}
          ]
        }]).then(({bless}) => bless);
      }
    }

    function provideExitCode({success}) {
      return success ? 0 : 1;
    }
  }


  function blessAll(suites, cfg) {
    output.log({happy: 'Blessing tests...'});
    const blessInAllSuites = Promise.all(suites.map(suite => {
      let chaplain = setupChaplain(suite, cfg);
      return chaplain.blessSuite(callbacks.bless);
    })).then(resultObjects => _.flatten(resultObjects));

    return blessInAllSuites
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

  function reportErrors(err) {
    if (!output) output = setupOutput({}, write, writeError);

    if (err.code == 'EUSERFACING') {
      output.error({sad: err.message});
    } else {
      output.error({sad: "Unexpected error:"});
      output.error(err.stack);
      output.error({sad: "Please report this issue here: "},
        {highlighted: "https://github.com/krajzeg/chaplain/issues"});
    }

    throw new TerminationError(2, err.message);
  }
}
