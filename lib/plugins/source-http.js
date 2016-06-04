/* jshint node: true, esversion: 6 */
"use strict";

import _ from 'lodash';
import urls from 'url';
const goodGuy = require('good-guy-http')({
  cache: false,
  maxRetries: 0,
  timeout: 2000
});
import {UserFacingError} from '../errors';

module.exports = {
  plugin:   'source',
  triggers: ['url', 'request'],

  create(config, test) {
    const rawRequest = test.request || {url: test.url};
    const timeout = _.get(test, 'http.timeout') || _.get(config, 'http.timeout');

    return {
      fetch(context) {
        return Promise.resolve()
          .then(() => setProperHost(context, rawRequest))
          .then(req => setTimeout(timeout, req))
          .then(req => goodGuy(req))
          .catch(err => {
            if (err.response) {
              return err.response;
            } else if (err.code == 'ETIMEDOUT') {
              throw new UserFacingError([
                "Request timed out and the server did not give us a response.\n",
                "The timeout was ", (timeout || 2000) ,"ms - you can use the ", {highlighted: 'http.timeout'}, " property to change it."
              ]);
            } else {
              throw new UserFacingError([
                "Couldn't make your HTTP request:\n",
                err.message
              ]);
            }
          });
      },

      description() {
        const method = rawRequest.method || 'GET';
        const url = rawRequest.url;
        return `HTTP ${method} ${url}`;
      }
    };

    function setProperHost({serverRoot}, req) {
      if (!serverRoot) {
        throw new UserFacingError([
          "It seems you have HTTP tests, but no HTTP server for tests set up.\n",
          "You can use the ", {highlighted: 'server'}, " property to set an app, server, or external host to test.\n"
        ]);
      }
      const properUrl = urls.resolve(serverRoot, req.url);
      return _.extend({}, req, {url: properUrl});
    }

    function setTimeout(timeout, req) {
      if (timeout) req.timeout = timeout;
      return req;
    }
  }
};
