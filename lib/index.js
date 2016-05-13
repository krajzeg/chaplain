/* jshint node: true, esversion: 6 */
"use strict";

import _ from 'lodash';

export function run(suite, config) {
  config = sanitizeConfig(config);
  const callbacks = config.callbacks;

  const results = _.object(suite.tests.map(test => {
    callbacks.testStarted(test);
    const result = {status: 'ok'};
    callbacks.testFinished(test, result);
    return [test, result];
  }));

  return Promise.resolve({
    success: !_.any(results, r => r.status != 'ok'),
    results
  });
}


const DEFAULT_CONFIG = {
  callbacks: {}
};

const CALLBACK_NAMES = ['testStarted', 'testFinished'];

function sanitizeConfig(cfg) {
  cfg = _.defaults(cfg || {}, DEFAULT_CONFIG);
  CALLBACK_NAMES.forEach(name => {
    if (!cfg.callbacks[name]) {
      cfg.callbacks[name] = ()=>{};
    }
  });
  return cfg;
}
