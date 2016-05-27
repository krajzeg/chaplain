/* jshint node: true, esversion: 6 */
"use strict";

import Promise from "bluebird";

export function createBeforeAfter(suite) {
  return {
    runBefores() { return runAll(suite.befores || [], suite.context); },
    runAfters()  { return runAll(suite.afters || [], suite.context); }
  };

  function runAll(fns, suiteContext) {
    return fns.reduce((promise, fn) => promise.then(() => fn(suiteContext)), Promise.resolve());
  }
}
