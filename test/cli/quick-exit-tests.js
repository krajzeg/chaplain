/* jshint node: true, esversion: 6 */
"use strict";

import {assert} from 'chai';
import path from 'path';
import {runCLITest} from "../helpers/test-cli";

describe("CLI", () => {
  it("should quit immediately if it finds no testfile", () => {
    return runCLITest({files: {}})
      .then(({exitCode, stderr, stdout}) => {
        assert.strictEqual(exitCode, 2);
        assert.ok(stderr.includes("It seems your testfile: chaplain.tests.js is missing."));
        assert.equal(stdout, "");
      });
  });

  it("should run a testfile with no tests correctly", () => {
    return runCLITest({
      files: path.join(process.cwd(), 'test-data/empty-suite'),
      args: ['-IC', '-f', 'empty-suite.chaplain.js']
    }).then(({exitCode, stdout}) => {
      assert.strictEqual(exitCode, 0);
      assert.ok(stdout.includes("All tests passed"));
      assert.ok(stdout.includes("0 in total"));
    });
  });

  it("should refuse to run 'chaplain bless' with no pattern", () => {
    return runCLITest({
      args: ['bless']
    }).then(({exitCode, stdout, stderr}) => {
      assert.strictEqual(exitCode, 2);
      assert.ok(stderr.includes("You have to specify which tests to bless."));
      assert.ok(stdout.includes("Usage:\n"));
    });
  });

  it("should complain if no tests match pattern", () => {
    return runCLITest({
      files: path.join(process.cwd(), 'test-data/empty-suite'),
      args: ['bless', 'something', '-IC', '-f', 'empty-suite.chaplain.js']
    }).then(({exitCode, stdout, stderr}) => {
      assert.strictEqual(exitCode, 2);
      assert.ok(stderr.includes("Found no matching test(s) to bless."));
    });
  });

  it("should complain on -fnospace arg syntax", () => {
    // this is because minimist does not support it
    return runCLITest({
      files: path.join(process.cwd(), 'test-data/empty-suite'),
      args: ['-fempty-suite.chaplain.js']
    }).then(({exitCode, stdout, stderr}) => {
      assert.strictEqual(exitCode, 2);
      assert.ok(stderr.includes("Please specify filename arguments with a space"));
    });
  });

  it("should provide usage on unknown commands", () => {
    return runCLITest({
      files: path.join(process.cwd(), 'test-data/empty-suite'),
      args: ['frob', 'something']
    }).then(({exitCode, stdout, stderr}) => {
      assert.strictEqual(exitCode, 2);
      assert.ok(stderr.includes("Unknown command: frob"));
      assert.ok(stdout.includes("Usage:\n"));
    });
  });



  it("should provide help when asked", () => {
    return runCLITest({
      args: ['--help']
    }).then(({exitCode, stdout, stderr}) => {
      assert.strictEqual(exitCode, 0);
      assert.strictEqual(stderr, '');
      assert.ok(stdout.includes("Usage:\n"));
      assert.ok(stdout.includes("Test patterns:\n"));
      assert.ok(stdout.includes("Options:\n"));
    });
  });
});
