/* jshint node: true, esversion: 6 */
"use strict";

import express from 'express';
import {assert} from 'chai';
import setupOutput from '../../lib/cli/output';
import expectRejection from '../helpers/expect-rejection';

import serverPlugin from '../../lib/plugins/std-http-server';
import sourcePlugin from '../../lib/plugins/source-http';

describe("HTTP source", () => {
  // an Express app for testing purposes
  const app = express();
  app.get('/hello', (req, res) =>
    res.status(200).type('text/plain').send("Hi.")
  );
  app.get('/timeout', (req, res) => {
  });
  app.post('/post', (req, res) => res.send(req.headers['x-answer']));

  // a mock Chaplain testsuite
  const suite = {
    server: app,
    http: {timeout: 50}
  };

  // an output to test error message
  const out = setupOutput({color: false});

  // an HTTP server plugin with a context
  const srvInstance = serverPlugin.create(suite);
  let ctx = {};

  before(() => {
    return srvInstance.setup(ctx);
  });
  after(() => {
    return srvInstance.teardown(ctx);
  });

  it("should fetch non-error responses correctly", () => {
    return sourcePlugin.create(suite, {url: '/hello'})
      .fetch(ctx)
      .then(result => {
        assert.equal(result.httpVersion, '1.1');
        assert.equal(result.statusCode, 200);
        assert.equal(result.body, 'Hi.');
        assert.ok(result.headers);
      });
  });

  it("should fetch error responses correctly", () => {
    return sourcePlugin.create(suite, {url: '/404'})
      .fetch(ctx)
      .then(result => {
        assert.equal(result.httpVersion, '1.1');
        assert.equal(result.statusCode, 404);
        assert.equal(result.body, "Cannot GET /404\n");
        assert.ok(result.headers);
      });
  });

  it("should handle complex request objects correctly", () => {
    const request = {
      url: '/post',
      method: 'POST',
      headers: {'X-Answer': 'Ok.'}
    };
    return sourcePlugin.create(suite, {request})
      .fetch(ctx)
      .then(result => {
        assert.equal(result.httpVersion, '1.1');
        assert.equal(result.statusCode, 200);
        assert.equal(result.body, "Ok.");
        assert.ok(result.headers);
      });
  });

  it("should handle timeouts gracefully", () => {
    return expectRejection(sourcePlugin.create(suite, {url: '/timeout'}).fetch(ctx))
      .then(err => {
        assert.equal(err.code, 'EUSERFACING');
        const msg = out.prepareMessage(err.message);
        assert.ok(msg.includes('timed out'));
      });
  });

  it("should complain if no server is known", () => {
    return expectRejection(sourcePlugin.create(suite, {url: '/timeout'}).fetch({serverRoot: undefined}))
      .then(err => {
        assert.equal(err.code, 'EUSERFACING');
        const msg = out.prepareMessage(err.message);
        assert.ok(msg.includes('no HTTP server'));
      });
  });

  it("should wrap good-guy-http errors", () => {
    return expectRejection(sourcePlugin.create(suite, {url: '/timeout'}).fetch({serverRoot: 'http://127.0.0.1:1'}))
      .then(err => {
        assert.equal(err.code, 'EUSERFACING');
        const msg = out.prepareMessage(err.message);
        assert.ok(msg.includes("Couldn't make your HTTP request:\n"));
        assert.ok(msg.includes("ECONNREFUSED"));
      });
  });
});
