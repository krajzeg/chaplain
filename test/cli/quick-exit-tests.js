/* jshint node: true, esversion: 6 */
"use strict";

import {setupTestCLI} from '../helpers/test-cli';
import {assert} from 'chai';

describe("CLI", () => {
  it("should quit immediately if it finds no testfile", (done) => {
    const {cli, out} = setupTestCLI({ /* no files */ });

    cli.run().then(exitCode => {
      assert.strictEqual(exitCode, 2);
      assert.ok(out.stderr().includes("It seems your testfile: chaplain.tests.js is missing."));
    }).then(done).catch(done);
  });
});
