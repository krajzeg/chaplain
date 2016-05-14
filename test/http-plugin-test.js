/* jshint node: true, esversion: 6 */
"use strict";

import express from 'express';
import http from 'http';
import {assert} from 'chai';

import serverPlugin from '../lib/plugins/plugin-http-server';
import sourcePlugin from '../lib/plugins/plugin-http-source';

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

    srvInstance.setup()
      .then(srcInstance.fetch)
      .then((result) => {
        assert.deepEqual(result, {
          props: {
            statusCode: 200,
            mimeType: 'text/plain; charset=utf-8'
          },
          value: "Hi."
        });
      })
      .then(srvInstance.teardown)
      .then(done).catch(done);
  });
});
