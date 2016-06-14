/* jshint node: true, esversion: 6 */
"use strict";

import {assert} from 'chai';
import {createOutputFetcher} from '../../lib/steps/fetch-from-source';
import expectRejection from '../helpers/expect-rejection';
import setupOutput from '../../lib/cli/output';

describe("Fetch from source step", () => {
  const out = setupOutput({color: false});
  const fetcher = createOutputFetcher({
    plugins: [require('../../lib/plugins/source-function')]
  }, {
    timeout: 30
  });

  it("should pick the right plugin and store it", () => {
    const test = {fn: () => 'Hi.'};
    return fetcher.fetchOutput(test, {})
      .then(() => {
        assert.equal(test.source.description(), 'custom function');
      });
  });
  it("should return whatever the plugin returns", () => {
    const test = {fn: () => 'Hi.'};
    return fetcher.fetchOutput(test, {})
      .then(output => {
        assert.deepEqual(output, {value: 'Hi.', keyProps: {}});
      });
  });

  it("should throw correct error if plugin not found", () => {
    const test = {key: () => "test"};
    return expectRejection(fetcher.fetchOutput(test, {}))
      .then(err => {
        assert.equal(err.code, 'EUSERFACING');
        assert.ok(out.prepareMessage([err.message]).includes("No source could be identified"));
      });
  });

  it("should throw correct error on timeout", () => {
    // never-ending test
    const test = {fn: () => new Promise((resolve) => {}), key: () => "test"};
    return expectRejection(fetcher.fetchOutput(test, {}))
      .then(err => {
        assert.equal(err.code, 'EUSERFACING');
        assert.ok(out.prepareMessage([err.message]).includes("timed out"));
      });
  });
});
