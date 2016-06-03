/* jshint node: true, esversion: 6 */
"use strict";

import {runCLITest} from '../helpers/test-cli';
import {assert} from 'chai';
import path from 'path';

describe("CLI", () => {
  context("when running a suite with befores/afters", () => {
    let exitCode, stdout, stderr;

    before(() => {
      return runCLITest({
        files: path.join(process.cwd(), 'test-data/before-after'),
        args: ['-IC', '-f', 'before-after.chaplain.js', '-d', './']
      }).then(r => {
        exitCode = r.exitCode;
        stdout = r.stdout;
        stderr = r.stderr;
      });
    });

    it("should return an exit code of 0", () => {
      assert.equal(exitCode, 0);
    });
    it("should execute the test added in before()", () => {
      assert.ok(stdout.includes("All tests passed (1 in total)"));
    });
  });

  context("when running a suite with a failing before()", () => {
    let exitCode, stdout, stderr;

    before(() => {
      return runCLITest({
        files: path.join(process.cwd(), 'test-data/failing-before'),
        args: ['-IC', '-f', 'failing-before.chaplain.js', '-d', './']
      }).then(r => {
        exitCode = r.exitCode;
        stdout = r.stdout;
        stderr = r.stderr;
      });
    });

    it("should exit with exit code 2", () => assert.equal(exitCode, 2));
    it("should report the correct exception", () => {
      assert.ok(stderr.includes("This should be the reported exception."));
    });
  });

  context("when running a suite with a failing after()", () => {
    let exitCode, stdout, stderr;

    before(() => {
      return runCLITest({
        files: path.join(process.cwd(), 'test-data/failing-after'),
        args: ['-IC', '-f', 'failing-after.chaplain.js', '-d', './']
      }).then(r => {
        exitCode = r.exitCode;
        stdout = r.stdout;
        stderr = r.stderr;
      });
    });

    it("should exit with exit code 2", () => assert.equal(exitCode, 2));
    it("should report the correct exception", () => {
      assert.ok(stderr.includes("This should be the reported exception."));
    });
  });
});
