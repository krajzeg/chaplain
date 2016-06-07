suite('weird-types', function() {
  var express = require('express');
  var app = express();
  app.get('/mapped', function(req, res) {
    res.type('application/x-mapped').send('{"a": 42}');
  });
  app.get('/not-mapped', function(req,res) {
    res.type('application/x-not-mapped').send("Hello.");
  });

  config({
    contentTypes: {
      'application/x-mapped': 'application/json'
    },
    app: app
  });

  test('mapped', {url: '/mapped'});
  test('not-mapped', {url: '/not-mapped'});
});
