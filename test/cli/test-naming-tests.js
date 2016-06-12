/* jshint node: true, esversion: 6 */
"use strict";

import {runCLITest} from '../helpers/test-cli';
import {assert} from 'chai';
import path from 'path';

describe("Test names", () => {
  it("should be allowed to be the same in different suites", () => {
    return runCLITest({
      files: path.join(process.cwd(), 'test-data/same-name-diff-suites'),
      args: ['-IC', '-f', 'same-name-diff-suites.chaplain.js', '-d', '.']
    }).then(({exitCode, stdout, stderr}) => {
      assert.strictEqual(exitCode, 1);
      assert.ok(stdout.includes('CHANGED: suite-2:orange'));
      assert.notOk(stdout.includes('suite-1:orange'));
      assert.ok(stderr.includes('1 changed test(s)'));
    });
  });

  it("should not be allowed to repeat within suite", () => {
    return runCLITest({
      files: path.join(process.cwd(), 'test-data/duplicate-test'),
      args: ['-IC', '-f', 'duplicate-test.chaplain.js', '-d', '.']
    }).then(({exitCode, stderr}) => {
      assert.strictEqual(exitCode, 2);
      console.log(stderr);
      assert.ok(stderr.includes("Suite 'suite' already has a test called 'duplicate'"));
    });
  });
});
