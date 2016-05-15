/* jshint node: true, esversion: 6 */
"use strict";

import _ from 'lodash';
import {sanitizeConfig, sanitizeCallbacks} from './config';


export default function setupChaplain(suite) {
  const config = sanitizeConfig(suite);

  return { runSuite };

  function runSuite(callbacks) {
    callbacks = sanitizeCallbacks(callbacks);

    const results = _.object(suite.tests.map(test => {
      callbacks.testStarted(test);
      const result = {status: 'ok'};
      callbacks.testFinished(test, result);
      return [test.name, result];
    }));

    return Promise.resolve({
      results,
      success: !_.any(results, r => r.status != 'ok')
    });
  }
}
