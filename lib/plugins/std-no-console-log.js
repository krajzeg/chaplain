/* jshint node: true, esversion: 6 */
"use strict";

import Promise from 'bluebird';
import http from 'http';

// This plugin disables console.log and console.error, since we want
// to take control over all output and not have noise from the app
// under test.
module.exports = {
  plugin:   'setup-teardown',
  triggers: true,

  create(config) {
    let originals = {};

    return {
      setup() {
        originals.log = console.log;
        originals.error = console.error;
        console.log = () => {};
        console.error = () => {};
      },

      teardown() {
        console.log = originals.log;
        console.error = originals.error;
      }
    };
  }
};
