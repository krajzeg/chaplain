suite('every-result', function() {

  var express = require('express');
  var app = express();
  app.get('/', function(req, res) {
    res.type('text/plain').send('Cucumber.');
  });

  config({app: app});

  // all tests go to the same URL, but have different
  // blessed output stored, hence different results
  test('passing', {url: '/'});
  test('new', {url: '/'});
  test('modified', {url: '/'});
  test('prop-change', {url: '/'});
});
