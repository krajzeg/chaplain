/* jshint node: true, esversion: 6 */
"use strict";

let assert = require('chai').assert;
import { Test, TestResult } from '../lib/test';
import { makeSource, makeEmptySource, equalsComparator } from './helpers';

describe("Test runs", () => {
  it("should return an IDENTICAL result when there are no changes", (done) => {
    var test = new Test("example-1", makeSource("A"), makeSource("A"), equalsComparator);
    test.run().then((result) => {
      assert.equal(result.result, TestResult.IDENTICAL);
      assert.deepEqual(result.changes, []);
    }).then(done).catch(done);
  });

  it("should return a DIFFERENT result when there are changes", (done) => {
    var test = new Test("example-2", makeSource("A"), makeSource("B"), equalsComparator);
    test.run().then((result) => {
      assert.equal(result.result, TestResult.DIFFERENT);
      assert.deepEqual(result.changes, ["A != B"]);
    }).then(done).catch(done);
  });

  it("should return a FRESH result if there is no known output", (done) => {
    var test = new Test("example-3", makeEmptySource(), makeSource("B"), equalsComparator);
    test.run().then((result) => {
      assert.equal(result.result, TestResult.FRESH);
      assert.strictEqual(result.previous, undefined);
      assert.deepEqual(result.changes, []);
    }).then(done).catch(done);
  });

  it("should return a FAILED result if an exception is thrown", (done) => {
    var test = new Test("example-4", makeEmptySource(), () => {
      throw new Error("Argh!");
    }, equalsComparator);

    test.run().then((result) => {
      assert.equal(result.result, TestResult.FAILED);
      assert.ok(result.error);
      assert.equal(result.error.message, "Argh!");
    }).then(done).catch(done);
  });
});
