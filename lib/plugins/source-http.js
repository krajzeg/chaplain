/* jshint node: true, esversion: 6 */
"use strict";

import _ from 'lodash';
import urls from 'url';
const goodGuy = require('good-guy-http')({
  cache: false
});
import {UserFacingError} from '../errors';

module.exports = {
  plugin:   'source',
  triggers: ['url', 'request'],

  create(config, test) {
    const rawRequest = test.request || {url: test.url};

    return {
      fetch(context) {
        return Promise.resolve()
          .then(() => setProperHost(context, rawRequest))
          .then((req) => goodGuy(req))
          .then((res) => responseToChaplainObject(res))
          .catch((err) => {
            if (err.response) {
              return responseToChaplainObject(err.response);
            } else {
              throw err;
            }
          });
      },

      description() {
        const method = rawRequest.method || 'GET';
        const url = rawRequest.url;
        return `HTTP ${method} ${url}`;
      }
    };

    function setProperHost(context, req) {
      if (!context.proto || !context.host) {
        throw new UserFacingError([
          "It seems you have HTTP tests, but no HTTP server for tests set up.\n",
          "You can use the ", {highlighted: 'server'}, " property to test on an http-module compatible server,\n",
          "or the ", {highlighted: 'app'}, " property to test an express app."
        ]);
      }

      const urlParts = urls.parse(req.url);
      urlParts.protocol = context.proto;
      urlParts.host = context.host;

      return _.extend({}, req, {url: urls.format(urlParts)});
    }
  }
};


function responseToChaplainObject(res) {
  return {
    keyProps: {
      'status code': res.statusCode,
      'type': parseContentType(res.headers['content-type'])
    },
    value: res.body
  };
}

function parseContentType(type) {
  type = type || 'text/plain';
  if (type.includes(';')) {
    type = type.substring(0, type.indexOf(';')).trim();
  }
  return type;
}
