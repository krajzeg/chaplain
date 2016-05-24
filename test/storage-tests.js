/* jshint node: true, esversion: 6 */
"use strict";

import {assert} from 'chai';
import setupStorage from '../lib/storage/storage';
import createMockFS from './helpers/mock-fs';

describe("Blessed storage", () => {
  let storage;
  const aTest = {name: 'a test ą', suite: {name: 'a suite ę'}};

  before((done) => {
    createMockFS({})
      .then(fs => {
        storage = setupStorage({fs, storageDir: '.test'})
      }).then(done).catch(done);
  });

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
