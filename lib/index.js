/* jshint node: true, esversion: 6 */
"use strict";

import _ from 'lodash';
import Promise from 'bluebird';
import {sanitizeConfig, sanitizeCallbacks} from './config';

export default function setupChaplain(suite) {
  const config = sanitizeConfig(suite);

  // collect all the relevant setup/teardown plugins
  // this means plugins that were triggered by a property
  // somewhere in our suite configuration
  const stdPlugins = config.plugins
    .filter(p => p.plugin == 'setup-teardown')
    .filter(p => _.intersection(p.triggers, _.keys(suite)).length > 0)
    .map(p => p.create(suite));

  // returns a properly setup chaplain object
  return {
    runSuite
  };

  function runSuite(callbacks) {
    callbacks = sanitizeCallbacks(callbacks);

    return performSetup()
      .then(() => runAllTests(suite.tests, callbacks))
      .then(individualResults => ({
        results: individualResults,
        success: !_.any(individualResults, r => r.status != 'ok')
      }))
      .finally(performTeardown);
  }


  function performSetup() {
    return Promise.all(stdPlugins.map(p =>
        p.setup()
    ));
  }

  function runAllTests(tests, callbacks) {
    const resultPromises = tests.map(test => {
      callbacks.testStarted(test);

      return runTest(test)
        .then(result => {
          callbacks.testFinished(test, result);
          return [test.name, result];
        }).catch(err => {
          return [test.name, {status: 'exception', exception: err}];
        });
    });

    return Promise.all(resultPromises).then(_.object);
  }

  function runTest(test) {
    return Promise.resolve({status: 'ok'});
  }

  function performTeardown() {
    return Promise.all(stdPlugins.map(p =>
        p.teardown()
    ));
  }
}
