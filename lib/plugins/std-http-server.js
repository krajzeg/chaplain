/* jshint node: true, esversion: 6 */
"use strict";

import Promise from 'bluebird';

module.exports = {
  plugin:   'setup-teardown',
  triggers: ['server'],

  create(config) {
    // read configuration
    const server = config.server;
    const port = config.serverPort || 15315;
    if (!server.listen || !server.close) {
      throw new Error("The 'server' property should contain an http-module-compatible HTTP server.");
    }

    // promisify
    const serverP = Promise.promisifyAll(server);

    // return callbacks that will start/stop the server for tests
    return {
      setup() { return serverP.listenAsync(port); },
      teardown() { return serverP.closeAsync(); }
    };
  }
};
