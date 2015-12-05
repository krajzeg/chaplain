/* jshint node: true, esversion: 6 */
"use strict";

let assert = require('chai').assert;
import { Storage } from '../lib/storage';
import { cleanScratch, SCRATCH_DIR } from './helpers/scratch-files';

describe("Storage", () => {
  beforeEach((done) => {
    cleanScratch().then(done).catch(done);
  });

  it("should be able to store blessed output and return it afterwards", (done) => {
    let storage = new Storage(SCRATCH_DIR);
    let output = {text: "Hi!"};

    storage.blessOutput("example", output).then(() => {
      return storage.getBlessedOutput("example");
    }).then((blessed) => {
      assert.deepEqual(blessed, output);
    }).then(done).catch(done);
  });

  it("should return 'undefined' when ask for blessed output that doesn't exist", (done) => {
    let storage = new Storage(SCRATCH_DIR);
    storage.getBlessedOutput("bogus").then((output) => {
      assert.strictEqual(output, undefined);
    }).then(done).catch(done);
  });
});
