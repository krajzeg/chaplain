/* jshint node: true, esversion: 6 */
"use strict";

import {runCLITest} from '../helpers/test-cli';
import {assert} from 'chai';
import path from 'path';

describe("CLI", () => {
  context("when running a suite with all result types interactively", () => {
    let firstRun, secondRun;

    before(() => {
      return runCLITest({
        files: path.join(process.cwd(), 'test-data/every-result-type'),
        args: ['-iC', '-f', 'every-result-type.chaplain.js', '-d', './'],
        promptAnswers: [
          {bless: 'y'},
          {bless: 'n'},
          {bless: 'n'},
          {bless: 'q'}
        ]
      }).then(result => { firstRun = result; })
        .then(() => runCLITest({
          fs: firstRun.fs,
          args: ['-IC', '-f', 'every-result-type.chaplain.js', '-d', './']
        }))
        .then(result => { secondRun = result; });
    });

    it("should have failed 4 out of 6 tests", () => {
      assert.equal(firstRun.exitCode, 1);
      assert.ok(firstRun.stderr.includes("Some failing tests (4 out of 6) remain:"));
    });
    it("should have written the right blessed content file", () => {
      assert.ok(firstRun.fs.getFileContents('./every-result.new.json'));
    });
    it("should fail 4 out of 6 tests on the second run", () => {
      assert.equal(secondRun.exitCode, 1);
      assert.ok(secondRun.stderr.includes("Some failing tests (4 out of 6) remain:"));
    });
  });
});
