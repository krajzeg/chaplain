/* jshint node: true, esversion: 6 */
"use strict";

import readTestFile from '../lib/cli/read-testfile/read-testfile';
import _ from 'lodash';
import fs from 'fs';
import {assert} from 'chai';

describe("Reading suites from testfiles", () => {
  it("should work for an empty suite", () =>
    readTestFile(fs, './test-data/read-testfile-tests/empty-testfile.js')
      .then(suites => {
        assert.ok(suites[0].context);
        const result = suites.map(s => _.omit(s, ['context']));
        assert.deepEqual(result, [
          {name: 'empty', tests: []}
        ]);
      })
  );

  it("should work for a suite with all bells and whistles", () =>
    readTestFile(fs, './test-data/read-testfile-tests/bells-and-whistles.js')
      .then(([suite]) => {
        assert.ok(suite);
        assert.equal(suite.name, "bells");
        assert.strictEqual(suite.cfg, true);
        assert.lengthOf(suite.tests, 3);

        let [a,b,c] = suite.tests;
        assert.deepEqual(a, {name: 'a', url: '/a'});
        assert.equal(b.name, 'b');
        assert.typeOf(b.fn, 'function');
        assert.equal(c.name, 'c');
        assert.equal(c.type, 'application/json');
        assert.typeOf(c.fn, 'function');
      })
  );

  it("should work for two suites", () =>
    readTestFile(fs, './test-data/read-testfile-tests/two-suites.js')
      .then(([s1,s2]) => {
        assert.ok(s1.context && s2.context);
        s1 = _.omit(s1, ['context']);
        s2 = _.omit(s2, ['context']);
        assert.deepEqual(s1, {name: 'a', a: true, tests: [
          {name: 'a', url: '/a'}
        ]});
        assert.deepEqual(s2, {name: 'b', b: true, tests: [
          {name: 'b', url: '/b'}
        ]});
      })
  );
});
