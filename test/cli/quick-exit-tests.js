/* jshint node: true, esversion: 6 */
"use strict";

import {setupTestCLI} from '../helpers/test-cli';
import {assert} from 'chai';
import path from 'path';

describe("CLI", () => {
  it("should quit immediately if it finds no testfile", (done) => {
    let cli, out;

    setupTestCLI({files: {}})
      .then(t => {cli = t.cli; out = t.out;})
      .then(() => cli.run())
      .then(exitCode => {
      assert.strictEqual(exitCode, 2);
      assert.ok(out.stderr().includes("It seems your testfile: chaplain.tests.js is missing."));
    }).then(done).catch(done);
  });

  it("should run a testfile with no tests correctly", (done) => {
    let cli, out;
    setupTestCLI({
      files: path.join(process.cwd(), 'test-data/empty-suite'),
      args: ['-IC', '-f', 'empty-suite.chaplain.js']
    }).then(t => {cli = t.cli; out = t.out;})
      .then(() => cli.run())
      .then(exitCode => {
        assert.strictEqual(exitCode, 0);
        assert.ok(out.stdout().includes("All tests passed"));
        assert.ok(out.stdout().includes("0 in total"));
      })
      .then(done).catch(done);
  });
});
