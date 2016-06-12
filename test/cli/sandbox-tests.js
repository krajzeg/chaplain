/* jshint node: true, esversion: 6 */
"use strict";

import {runCLITest} from '../helpers/test-cli';
import {assert} from 'chai';
import path from 'path';

describe("Testfile sandbox", () => {
  it("should include all the node globals", () => {
    return runCLITest({
      files: path.join(process.cwd(), 'test-data/sandbox-test'),
      args: ['-IC', '-f', 'sandbox-test.chaplain.js']
    }).then(({exitCode, stdout}) => {
      assert.strictEqual(exitCode, 1);
      assert.ok(stdout.includes('"everythingIsHere": true'));
    });
  });
});
