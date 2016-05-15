/* jshint node: true, esversion: 6 */
"use strict";

import _ from 'lodash';
import {sanitizeConfig, sanitizeCallbacks} from './config';

export default function setupChaplain(suite) {
  const config = sanitizeConfig(suite);

  return { runSuite };

  function runSuite(callbacks) {
    callbacks = sanitizeCallbacks(callbacks);

    return runAllTests(suite.tests, callbacks)
      .then(individualResults => ({
        results: individualResults,
        success: !_.any(individualResults, r => r.status != 'ok')
      }));
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
}
