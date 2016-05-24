/* jshint node: true, esversion: 6 */
"use strict";

import {setupTestCLI} from '../helpers/test-cli';
import {assert} from 'chai';
import path from 'path';

describe("CLI", () => {
  describe("when running a suite with all result types in -I mode", () => {
    let cli, out, exitCode;

    before((done) => {
      setupTestCLI({
        files: path.join(process.cwd(), 'test-data/every-result-type'),
        args: ['-IC', '-f', 'every-result-type.chaplain.js', '-d', './']
      })
        .then(t => {cli = t.cli; out = t.out})
        .then(() => cli.run())
        .then(exit => {exitCode = exit;})
        .then(done).catch(done);
    });

    it("should return an exit code of 1", () => {
      assert.equal(exitCode, 1);
    });
    it("should not return any specific info for tests that pass");
    it("should return correct info for new tests");
    it("should return correct info for changes in content");
  });
});
