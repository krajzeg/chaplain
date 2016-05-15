/* jshint node: true, esversion: 6 */
"use strict";

import _ from 'lodash';
import {sanitizeConfig, sanitizeCallbacks} from './config';

export default function setupChaplain(suite) {
  const config = sanitizeConfig(suite);

  return { runSuite };

  function runSuite(callbacks) {
    callbacks = sanitizeCallbacks(callbacks);

    const resultPromises = suite.tests.map(test => {
      callbacks.testStarted(test);

      runTest(test)
        .then(result => {
          callbacks.testFinished(test, result);
          return [test.name, result];
        }).catch(err => {
          return [test.name, {status: 'exception', exception: err}];
        });
    });

    return Promise.all(resultPromises)
      .then(_.object)
      .then(results => ({
        results,
        success: !_.any(results, r => r.status != 'ok')
      }));
  }

  function runTest(test) {
    return Promise.resolve({status: 'ok'});
  }
}
