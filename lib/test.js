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

  run() {
    // we need to get both the old output and the new one
    let promises = [this.previousFn(this.name), this.currentFn(this.name)];

    return BB.all(promises).spread((previous, current) => {
      if (!previous) {
        // we have no previous output, so nothing to compare with
        return {
          previous, current,
          result: TestResult.FRESH,
          changes: []
        };
      } else {
        // we have both outputs, we compare them using the strategy provided
        return this.comparator(previous, current).then(function(changes) {
          changes = changes || [];
          let result = (changes.length > 0) ? TestResult.DIFFERENT : TestResult.IDENTICAL;
          return {
            previous, current,
            result, changes
          };
        });
      }
    });
  }
}
