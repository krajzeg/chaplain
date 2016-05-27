/* jshint node: true, esversion: 6 */
"use strict";

import Promise from "bluebird";
import {UserFacingError} from "../errors";

export function createBeforeAfter(suite) {
  return {
    runBefores() { return runAll('before', suite.befores || [], suite.context); },
    runAfters()  { return runAll('after', suite.afters || [], suite.context); }
  };

  function runAll(name, fns, suiteContext) {
    const runEverything = fns.reduce((promise, fn) => promise.then(() => fn(suiteContext)), Promise.resolve());
    return runEverything.catch(err => {
      if (err.code != 'EUSERFACING') {
        throw new UserFacingError([
          "Your ", {highlighted: `${name}() handler`},
          " for suite ", {highlighted: suite.name},
          " threw an exception:\n",
          (err.stack || err)
        ]);
      } else {
        throw err;
      }
    });
  }
}
