/* jshint node: true, esversion: 6 */
"use strict";

import {setupTestCLI} from '../helpers/test-cli';
import {assert} from 'chai';
import path from 'path';

describe("CLI", () => {
  describe("when running a suite with all result types in -I mode", () => {
    let exitCode, stdout, stderr;

    before((done) => {
      let cli, out;
      setupTestCLI({
        files: path.join(process.cwd(), 'test-data/every-result-type'),
        args: ['-IC', '-f', 'every-result-type.chaplain.js', '-d', './']
      })
        .then(t => {cli = t.cli; out = t.out})
        .then(() => cli.run())
        .then(exit => {
          exitCode = exit;
          stdout = out.stdout();
          stderr = out.stderr();
        })
        .then(done).catch(done);
    });

    it("should return an exit code of 1", () => {
      assert.equal(exitCode, 1);
    });
    it("should not return any specific info for tests that pass", () => {
      assert.notOk(stdout.includes("every-result:passing"));
    });
    it("should return correct info for new tests", () => {
      assert.ok(stdout.includes("every-result:new is newly added"));
    });
    it("should return correct info for changes in content", () => {
      assert.ok(stdout.includes("every-result:changed has changes"));
    });
    it("should return correct info for changes in key props", () => {
      assert.ok(stdout.includes("every-result:key-prop-change has changed key properties"));
    });
  });
});
