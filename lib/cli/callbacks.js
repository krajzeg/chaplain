/* jshint node: true, esversion: 6 */
"use strict";

export const RUN_CALLBACKS = {
  testFinished(test, result) {
    console.log(`      ${test.name}: ${result.status}`);
  }
};
export const BLESS_CALLBACKS = {
  testBlessed(test) {
    console.log(`      ${test.name}: blessed`);
  }
};
