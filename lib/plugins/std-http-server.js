/* jshint node: true, esversion: 6 */
"use strict";

import _ from 'lodash';
import Promise from 'bluebird';
import http from 'http';
import {UserFacingError} from '../errors';

// HTTP servers used for tests are started at consecutive ports
// to prevent collisions with multiple suites running at once.
let nextHTTPServerPort = 15315;

module.exports = {
  plugin:   'setup-teardown',
  triggers: ['server', 'app'],

  create(config) {
    // read configuration

    if (_.has(config, 'app') && (typeof config.app != 'function')) {
      throw new UserFacingError(["The ", {highlighted: 'app'}, " property should be an express app, or another http.createServer()-compatible request listener."]);
    }
    if (_.has(config, 'server') && !(config.server.listen && config.server.close)) {
      throw new UserFacingError(["The ", {highlighted: 'server'}, " property should contain an http.Server."]);
    }

    const server = config.app ? http.createServer(config.app) : config.server;
    const port = config.serverPort || (nextHTTPServerPort++);

    // promisify
    const serverP = Promise.promisifyAll(server);

    // return callbacks that will start/stop the server for tests
    return {
      setup(context) {
        context.proto = 'http';
        context.host = `localhost:${port}`;
        return serverP.listenAsync(port);
      },
      teardown(context) {
        context.proto = context.host = undefined;
        return serverP.closeAsync();
      }
    };
  }
};
