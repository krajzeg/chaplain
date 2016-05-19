/* jshint node: true, esversion: 6 */
"use strict";

import Promise from 'bluebird';
import http from 'http';
import {UserFacingError} from '../errors';

module.exports = {
  plugin:   'setup-teardown',
  triggers: ['server', 'app'],

  create(config) {
    // read configuration
    if (config.app && typeof config.app != 'function') {
      throw new UserFacingError(["The ", {highlighted: 'app'}, " property should be an express app, or another http.createServer()-compatible request listener."]);
    }
    if (config.server && !(config.server.listen && config.server.close)) {
      throw new UserFacingError(["The ", {highlighted: 'server'}, " property should contain an http.Server."]);
    }

    const server = config.app ? http.createServer(config.app) : config.server;
    const port = config.serverPort || 15315;

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
