/* jshint node: true, esversion: 6 */
"use strict";

import {assert} from 'chai';
import expectRejection from '../helpers/expect-rejection';
var sourceFn = require('../../lib/plugins/source-function');

describe("Function source plugin", () => {
  it("should turn strings into proper chaplain objects", () => {
    let src = sourceFn.create({}, {fn: () => "Hello!"});
    return src.fetch({})
      .then(obj => {
        assert.deepEqual(obj, {
          keyProps: {},
          value: "Hello!"
        });
      });
  });

  it("should turn non-strings into proper chaplain objects", () => {
    let src = sourceFn.create({}, {fn: () => 42});
    return src.fetch({})
      .then(obj => {
        assert.deepEqual(obj, {
          keyProps: {},
          value: "42"
        });
      });
  });

  it("should throw UserFacingError on exceptions", () => {
    // this triggers a ReferenceError on purpose
    let src = sourceFn.create({}, {fn: () => a}); // jshint ignore:line
    return expectRejection(src.fetch({}))
      .then(err => {
        assert.equal(err.code, 'EUSERFACING');
        assert.ok(JSON.stringify(err.message).includes("ReferenceError"));
      });
  });

  it("should work with promises that resolve", () => {
    let src = sourceFn.create({}, {
      fn: () => Promise.resolve("Hello.")
    });
    return src.fetch({}).then(obj => {
      assert.equal(obj.value, "Hello.");
    });
  });

  it("should work with promises that reject", () => {
    let src = sourceFn.create({}, {
      // this triggers a ReferenceError on purpose
      fn: () => Promise.resolve("Hello.").then(() => a) // jshint ignore:line
    });
    return expectRejection(src.fetch({})).then(err => {
      assert.equal(err.code, 'EUSERFACING');
      assert.ok(JSON.stringify(err.message).includes("ReferenceError"));
    });
  });
});
