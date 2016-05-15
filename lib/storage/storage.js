/* jshint node: true, esversion: 6 */
"use strict";

export default function setupStorage(config) {
  // completely mock implementation for now
  return {
    fetch(testName) {
      return undefined;
    },

    store(testName, value) {
      return;
    }
  };
}
