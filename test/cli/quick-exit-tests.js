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
});
