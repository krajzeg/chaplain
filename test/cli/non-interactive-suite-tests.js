/* jshint node: true, esversion: 6 */
"use strict";

import {runCLITest} from '../helpers/test-cli';
import {assert} from 'chai';
import path from 'path';
import Promise from 'bluebird';
const fs = Promise.promisifyAll(require('fs'));

describe("CLI", () => {
  context("when running a suite with all result types in -I mode", () => {
    let exitCode, stdout, stderr;

    before(() => {
      return runCLITest({
        files: path.join(process.cwd(), 'test-data/every-result-type'),
        args: ['-IC', '-f', 'every-result-type.chaplain.js', '-d', './']
      }).then(result => {
        exitCode = result.exitCode;
        stdout = result.stdout;
        stderr = result.stderr;
      });
    });

    it("should return an exit code of 1", () => {
      assert.equal(exitCode, 1);
    });
    it("should have failed 5 out of 6 tests", () => {
      assert.ok(stderr.includes("Some failing tests (5 out of 6) remain:"));
    });
    it("should not return any specific info for tests that pass", () => {
      assert.notOk(stdout.includes("every-result:passing"));
    });
    it("should return correct info for new tests", () => {
      assert.ok(stdout.includes("NEW: every-result:new"));
    });
    it("should return correct info for changes in content", () => {
      assert.ok(stdout.includes("CHANGED: every-result:changed"));
    });
    it("should return correct info for changes in key props", () => {
      assert.ok(stdout.includes("PROPERTIES CHANGED: every-result:key-prop-change"));
    });
    it("should return correct info for handled errors", () => {
      assert.ok(stdout.includes("PROBLEM IN: every-result:error"));
    });
    it("should return correct info for unhandled exceptions", () => {
      assert.ok(stdout.includes("EXCEPTION IN: every-result:exception (whoops!)"));
      assert.ok(stdout.includes("Please report this issue here: https://github.com/krajzeg/chaplain/issues"));
      assert.ok(stdout.includes("at every-result-type.chaplain.js")); // stacktrace
    });
  });

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

  context("when using app-specific content types", () => {
    let exitCode, stdout, stderr;

    before(() => {
      return runCLITest({
        files: path.join(process.cwd(), 'test-data/weird-types'),
        args: ['-IC', '-f', 'weird-types.chaplain.js', '-d', './']
      }).then(r => {
        exitCode = r.exitCode;
        stdout = r.stdout;
        stderr = r.stderr;
      });
    });

    it("should return an exit code of 1", () => {
      assert.equal(exitCode, 1);
    });
    it("should obey the type mappings", () => {
      assert.ok(stdout.includes("41 -> 42")); // characteristic output for JSON compares
    });
    it("should fall back to plaintext if not mapped", () => {
      assert.ok(stdout.includes("HiHello.")); // characteristic output for JSON compares
    });
  });

  context("when using require()'s within a suite", () => {
    let exitCode, stdout, stderr;
    before(() => {
      const suitePath = path.join(process.cwd(), 'test-data/suite-with-require/suite-with-require.chaplain.js');
      const suiteDir = path.dirname(suitePath);
      return fs.readFileAsync(suitePath)
        .then(contents => runCLITest({
          files: {[suitePath]: contents},
          args: ['-IC', '-f', suitePath, '-d', suiteDir]
        })).then(r => {
          exitCode = r.exitCode;
          stdout = r.stdout;
          stderr = r.stderr;
        });
    });

    it("they should work as expected", () => {
      assert.equal(exitCode, 1);
      assert.ok(stdout.includes("NEW: with-require:required"));
      assert.ok(stdout.includes("Hello."));
    });
  });

  context("when 'chaplain bless'-ing a suite", () => {
    let exitCode, stdout, stderr, fs;

    before(() => {
      return runCLITest({
        files: path.join(process.cwd(), 'test-data/two-new'),
        args: ['bless', 'two-new:a.*', '-C', '-f', 'two-new.chaplain.js', '-d', './']
      }).then(r => {
        exitCode = r.exitCode;
        stdout = r.stdout;
        stderr = r.stderr;
        fs = r.fs;
      });
    });

    it("should return an exit code of 0", () => {
      assert.equal(exitCode, 0);
    });
    it("should give the correct information", () => {
      assert.ok(stdout.includes("two-new:alpha: blessed"));
      assert.ok(stdout.includes(":-) Blessed 1 test(s)."));
      assert.strictEqual(stderr, '');
    });
    it("should save only the files it should", () => {
      assert.ok(fs.getFileContents('./two-new.alpha.json'));
      assert.notOk(fs.getFileContents('./two-new.beta.json'));
    });
  });
});
