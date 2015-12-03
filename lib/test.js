/* jshint node: true, esversion: 6 */
"use strict";

let _ = require('lodash');
let BB = require('bluebird');
let fs = BB.promisifyAll(require('fs'));

export const TestResult = {
  /** The output is identical to the "known good", blessed output. **/
  IDENTICAL: 'ok',
  /** The output is different from the blessed output. **/
  DIFFERENT: 'different',
  /** The test is new - no blessed output exists yet. **/
  FRESH: 'fresh',
  /** The test failed because of an unexpected error, usually during getting the new output. **/
  FAILED: 'failed'
};

export class Test {
  constructor(name, getPrevious, getCurrent, comparator, options = {}) {
    _.extend(this, {name, getPrevious, getCurrent, comparator, options});
  }

/*  getPreviousOutput() {
    let contentFile = `.blessed/${name}.output`;

    fs.existsAsync(contentFile).then((fileExists) => {
      if (fileExists) {
        return fs.readFileAsync(contentFile);
      } else {
        return undefined;
      }
    }).then(function(contents) {
      return (contents) ? contents.toString() : undefined;
    });
  }*/

  _compareProperties(previous, current) {
    return BB.resolve([]);
  }

  _compareText(previous, current) {
    return BB.resolve(this.comparator(previous.text, current.text));
  }

  run() {
    // we need to get both the old output and the new one
    return BB.try(() => {
      let promises = [this.getPrevious(this.name), this.getCurrent(this.name)];
      return BB.all(promises);
    }).then(([previous, current]) => {
      if (!previous) {
        // we have no previous output, so nothing to compare with
        return {
          current,
          result: TestResult.FRESH,
          changes: []
        };
      } else {
        // we have both outputs, we compare them
        return BB.all([
          // first the properties, using built-in logic
          this._compareProperties(previous, current),
          // then the text, using the provided comparator
          this._compareText(previous, current)
        ]).then((changes) => {
          // merge changes from both sources
          changes = _.flatten(changes);
          // the final result depends on whether we had any changes at all
          return {
            previous, current,
            changes,
            result: (changes.length > 0) ? TestResult.DIFFERENT : TestResult.IDENTICAL
          };
        });
      }
    }).catch((error) => {
      // we caught an exception, so the test fails with a special status
      return { error, result: TestResult.FAILED };
    });
  }
}
