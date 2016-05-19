/* jshint node: true, esversion: 6 */
"use strict";

import express from 'express';
import http from 'http';
import {assert} from 'chai';

import serverPlugin from '../lib/plugins/std-http-server';
import sourcePlugin from '../lib/plugins/source-http';

describe("HTTP plugin", () => {
  it("should handle servers and requests", (done) => {
    // an Express app for testing purposes
    const app = express();
    app.get('/hello', (req, res) =>
      res.status(200).type('text/plain').send("Hi.")
    );
    const srv = http.createServer(app);

    // a mock Chaplain testsuite
    const suite = {
      server: srv,
      tests: [
        {url: "/hello"}
      ]
    };

    const srvInstance = serverPlugin.create(suite);
    const srcInstance = sourcePlugin.create(suite, suite.tests[0]);

    let ctx = {};
    srvInstance.setup(ctx)
      .then(() => srcInstance.fetch(ctx))
      .then((result) => {
        assert.deepEqual(result, {
          keyProps: {
            'status code': 200,
            'type': 'text/plain'
          },
          value: "Hi."
        });
      })
      .then(() => srvInstance.teardown(ctx))
      .then(() => {
        assert.equal(ctx.host, undefined);
        assert.equal(ctx.proto, undefined);
      })
      .then(done).catch(done);
  });
});
