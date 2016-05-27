/* jshint node: true, esversion: 6 */
"use strict";

import _ from 'lodash';
import Promise from 'bluebird';
import http from 'http';

// HTTP servers used for tests are started at consecutive ports
// to prevent collisions with multiple suites running at once.
let nextHTTPServerPort = 15315;

module.exports = {
  plugin:   'setup-teardown',
  triggers: ['server', 'app'],

  create(config) {
    // read configuration
    if (_.has(config, 'app'))
      config.server = config.app;

    // extract a server instance from the configuration
    let {server} = config, serverRoot;
    const port = config.serverPort || (nextHTTPServerPort++);
    if (server.listen && server.close) {
      // http.Server, use directly
      serverRoot = `http://localhost:${port}`;
    } else if (typeof server == 'function') {
      // express app, or another request handler
      server = http.createServer(server);
      serverRoot = `http://localhost:${port}`;
    } else if (typeof server == 'string') {
      // a string, assume this is an external server somebody started for us
      serverRoot = server;
      server = undefined;
    }

    // promisify
    const serverP = server ? Promise.promisifyAll(server) : undefined;

    // return callbacks that will start/stop the server for tests
    return {
      setup(context) {
        context.serverRoot = serverRoot;
        return serverP ? serverP.listenAsync(port) : Promise.resolve();
      },
      teardown(context) {
        context.serverRoot = undefined;
        return serverP ? serverP.closeAsync() : Promise.resolve();
      }
    };
  }
};
