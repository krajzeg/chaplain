/* jshint node: true, esversion: 6 */
"use strict";

import {assert} from 'chai';
import mockFS from 'mock-fs';
import setupStorage from '../lib/storage/storage';

describe("Blessed storage", () => {
  const storage = setupStorage({
    fs: mockFS.fs(),
    storageDir: '.test'
  });
  const aTest = {name: 'a test ą', suite: {name: 'a suite ę'}};

  it('should return null on missing files', (done) => {
    storage.fetch(aTest)
      .then(obj => {
        assert.strictEqual(obj, null);
      }).then(done).catch(done);
  });

  it('should be able to write objects and read them back', (done) => {
    const stored = {hi: 'hello'};
    storage.store(aTest, stored)
      .then(() => storage.fetch(aTest))
      .then(fetched => {
        assert.deepEqual(fetched, stored);
      }).then(done).catch(done);
  });
});
