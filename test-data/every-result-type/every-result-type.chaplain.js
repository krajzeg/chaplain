var exceptionPlugin = {
  plugin: 'source',
  triggers: ['throwException'],
  create: function() {
    return {
      fetch: function(context) {
        return Promise.resolve().then(function() {
          throw new Error("Unexpected error.");
        });
      }
    };
  }
};

suite('every-result', function() {

  var express = require('express');
  var app = express();
  app.get('/', function(req, res) {
    res.type('text/plain').send('Cucumber.');
  });

  config({
    app: app,
    plugins: [
      exceptionPlugin
    ]
  });

  // all tests go to the same URL, but have different
  // blessed output stored, hence different results
  test('passing', {url: '/'});
  test('new', {url: '/'});
  test('changed', {url: '/'});
  test('key-prop-change', {url: '/'});
  test('error', {});
  test('exception', {throwException: true}); // uses the 'exception' plugin
});
