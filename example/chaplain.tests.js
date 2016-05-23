// This is an example test file, intended as a demonstration of
// everything that's possible. It will run properly, but the
// implementation of the server is missing, so it will not be
// very interesting to do so.

// Tests go in suites. One suite == one server/app to test.
// If you need to reconfigure your app for different tests (for
// example to insert different mock data), those different
// configuration go in different suites
suite('example-suite', function() {
  // Every suite has two parts - a config(), which specifies
  // stuff that applies to all the tests, and a series of
  // test() declarations - one per test.

  config({
    // these properties let you specify the app to test
    // you have to specify exactly one
    app: require('./my-app'), // any Express app, or other http.Server compatible request handler will do
    server: http.createServer(sth), // you can also create an http.Server yourself if that's convenient

    // chaplain detects what diff implementation to use by inspecting
    // the Content-type returned by the server. If it doesn't make the
    // right decision on its own, you can map your custom types
    // to one of the supported ones like that:
    contentTypes: { 'application/x-custom-type': 'application/json' },

    // each format has its own property which lets you configure
    // the comparison logic to better suit your needs
    // you can also use those properties on individual tests (see below)
    html: {
      // this one configures HTML comparison
      ignoreComments: true, // ignore changes in comments
      ignore: ['.ad', '[^data-ignore-me]'], // ignore changes in all nodes matching these selectors
      ignoreText: ['.contact-info'], // ignore changes to any text contained in nodes matching these selectors

      // for a full list, check out the npm hiff module - the options are passed to it directly
    },

    json: {
      ignore: ['_generatedOn', 'meta.validUntil[0]'] // ignore changes to properties matching these JSON paths
    }
  });

  // tests need to have a name and either a `url` or `request` property
  test('first-test', {url: '/url/relative/to/your/app'});

  // `request` lets you make more complex requests
  // we accept anything the npm request module accepts
  test('second-test', {
    request: {
      method: 'GET', url: '/resource', headers: {accept: 'application/json'}
    }
  });

  // the `json` and `html` comparison configuration can also be specified per-test
  test('fiddly-test', {
    url: '/json-with-crappy-metadata',
    json: { ignore: ['details.meta'] }
  });
});

// you can have multiple suites, of course
suite('another-suite', function() {
  config({app: require('./different-app')});
  //...
});
