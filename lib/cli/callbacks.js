/* jshint node: true, esversion: 6 */
"use strict";

export const DEFAULT_CALLBACKS = {
  testFinished(test, result) {
    console.log(`      ${test.name}: ${result.status}`);
  }
};
