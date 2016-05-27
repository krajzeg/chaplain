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

  it("should cope with non-strings", () => {
    const result = transform(42);
    assert.deepEqual(result, {
      keyProps: {type: 'text/plain'},
      value: '42'
    });
  });

  it("should leave fully-formed result objects alone", () => {
    const result = transform({
      keyProps: {type: 'application/json'},
      value: '{"hi": "there"}'
    });
    assert.deepEqual(transform(result), result);
  });
});
