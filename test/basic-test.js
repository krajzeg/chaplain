/* jshint node: true, esversion: 6 */
"use strict";

import {assert} from 'chai';
import chaplain from '../lib/index';

describe('Empty suite', () => {
  it('should return correct results', (done) => {
    chaplain({tests: []}).runSuite()
      .then(r => {
        assert.ok(r.success);
        assert.deepEqual(r.results, {});
      })
      .then(done).catch(done);
  });
});
