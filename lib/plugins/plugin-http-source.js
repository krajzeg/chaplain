/* jshint node: true, esversion: 6 */
"use strict";

import url from 'url';
const goodGuy = require('good-guy-http')({
  cache: false
});

module.exports = {
  plugin:   'source',
  triggers: ['url', 'request'],

  create(config, test) {
    const port = config.serverPort || 15315;
    const rawRequest = test.request || {url: test.url};
    const realRequest = setProperHost(rawRequest);

    return {
      fetch() {
        return goodGuy(realRequest)
          .then((res) => responseToChaplainObject(res))
          .catch((err) => {
            if (err.response) {
              return responseToChaplainObject(err.response);
            } else {
              throw err;
            }
          });
      }
    };

    function setProperHost(req) {
      const urlParts = url.parse(req.url);
      urlParts.protocol = 'http';
      urlParts.hostname = 'localhost';
      urlParts.port = port;
      return url.format(urlParts);
    }
  }
};


function responseToChaplainObject(res) {
  return {
    props: {
      statusCode: res.statusCode,
      mimeType: res.headers['content-type'] || 'text/plain'
    },
    value: res.body
  };
}
