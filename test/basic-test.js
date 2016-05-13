/* jshint node: true, esversion: 6 */
"use strict";

import {assert} from 'chai';
import {run} from '../lib/index';

describe('Empty suite', () => {
  it('should return correct results', (done) => {
    run({tests: []}, {})
      .then(r => {
        assert.ok(r.success);
        assert.deepEqual(r.results, {});
      })
      .then(done).catch(done);
  });
});
