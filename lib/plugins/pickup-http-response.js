/* jshint node: true, esversion: 6 */
"use strict";

import _ from 'lodash';

const HTTP_RESPONSE_PROPS = ['httpVersion', 'statusCode', 'headers', 'body'];
// This plugin picks up that the result was an HTTP response (http.IncomingMessage),
// and transforms it accordingly.
module.exports = {
  plugin: 'pickup',

  create() {
    return {
      triggers({value}) {
        return HTTP_RESPONSE_PROPS.every(prop => _.has(value, prop));
      },

      transform(result) {
        return responseToChaplainObject(result.value);
      }
    };
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

