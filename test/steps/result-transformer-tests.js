/* jshint node: true, esversion: 6 */
"use strict";

import {createResultTransformer} from "../../lib/steps/result-transformer";
import {prepareConfig} from "../../lib/config";
import {assert} from 'chai';

describe("Result transformer", () => {
  const config = prepareConfig({}, {}); // default config
  const transform = createResultTransformer(config);

  it("should pick up HTTP responses", () => {
    const result = transform({
      httpVersion: '1.1', statusCode: 200,
      headers: {'content-type': 'application/json'},
      body: '{"hi": "there"}'
    });
    assert.deepEqual(result, {
      keyProps: {type: 'application/json', 'status code': 200},
      value: '{"hi": "there"}'
    });
  });

  it("should pick up obvious JSON strings", () => {
    assert.deepEqual(transform('{"oh": "hello"}'), {
      keyProps: { type: 'application/json' },
      value: {oh: "hello"}
    });
  });

  it("should pick up JSON objects as JSON", () => {
    assert.deepEqual(transform({oh: "hi"}), {
      keyProps: { type: 'application/json' },
      value: {oh: "hi"}
    });
  });

  it("should not pick up non-JSON-serializable objects as JSON", () => {
    var selfRef = {toString: () => "[Self-referencing object]"};
    selfRef.ref = selfRef;
    assert.deepEqual(transform(selfRef), {
      keyProps: { type: 'text/plain' },
      value: "[Self-referencing object]"
    });
  });

  it("should not pick up JSON primitives as JSON", () => {
    assert.equal(transform('false').keyProps.type, "text/plain");
    assert.equal(transform('42').keyProps.type, "text/plain");
    assert.equal(transform('null').keyProps.type, "text/plain");
    assert.equal(transform('"Hi."').keyProps.type, "text/plain");
    assert.equal(transform(false).keyProps.type, "text/plain");
    assert.equal(transform(42).keyProps.type, "text/plain");
    assert.equal(transform(null).keyProps.type, "text/plain");
  });

  it("should mark strings it doesn't recognize as text/plain", () => {
    assert.deepEqual(transform("Cucumber."), {
      keyProps: {type: 'text/plain'},
      value: "Cucumber."
    });
  });

  it("should cope with non-strings", () => {
    const result = transform(42);
    assert.deepEqual(result, {
      keyProps: {type: 'text/plain'},
      value: '42'
    });
  });

  it("should cope with non-strings even marked as text/plain", () => {
    const result = transform({
      keyProps: {type: 'text/plain'},
      value: {not: 'a string'}
    });
    assert.equal(result.keyProps.type, 'text/plain');
    assert.equal(result.value, require('util').inspect({not: 'a string'}));
  });


  it("should use toString() if implemented when given non-strings as text/plain", () => {
    const result = transform({
      keyProps: {type: 'text/plain'},
      value: {
        toString() { return 'Hello!'; }
      }
    });
    assert.equal(result.keyProps.type, 'text/plain');
    assert.equal(result.value, "Hello!");
  });

  it("should leave fully-formed result objects alone", () => {
    const result = transform({
      keyProps: {type: 'application/json'},
      value: '{"hi": "there"}'
    });
    assert.deepEqual(transform(result), result);
  });
});
