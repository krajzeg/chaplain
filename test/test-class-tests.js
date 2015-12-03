/* jshint node: true, esversion: 6 */
"use strict";

let assert = require('chai').assert;

describe("Test runs", () => {
  it("should return an IDENTICAL result when there are no changes");
  it("should return a DIFFERENT result when there are changes");
  it("should return a FRESH result if there is no known output");
  it("should return a FAILED result if an exception is thrown");
});
