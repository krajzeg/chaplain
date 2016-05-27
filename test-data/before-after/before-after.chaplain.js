var Promise = require('bluebird');
var http  = require('http');

suite('ba', function() {
  var server;

  before(function(suite) {
    suite.config({server: 'http://localhost:12121'});
    suite.test('cucumber', {url: '/'});

    var express = require('express');
    var app = express();
    app.get('/', function(req, res) {
      res.type('text/plain').send('Cucumber.');
    });

    server = Promise.promisifyAll(http.createServer(app));
    return server.listenAsync(12121);
  });

  after(function() {
    return server.closeAsync();
  });
});
