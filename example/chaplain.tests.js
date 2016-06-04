// This is an example test file, intended as a demonstration of
// *everything* that's possible. As such, it is long, so its
// only intended to let you quickly check how something is done,
// and not as an example of good practice or something to read
// top-to-bottom.

// Tests go in suites. One suite == one server/app to test.
// If you need to reconfigure your app for different tests (for
// example to insert different mock data), those different
// configuration go in different suites
suite('example-suite', function() {
  // Every suite has two main parts - a config(), which specifies
  // stuff that applies to all the tests, and a series of
  // test() declarations - one per test.

  config({
    // the 'server' property lets you specify what to test
    // it can be an Express app, an http.Server/https.Server, or even just a URL
    // to an external server you want to test against
    server: require('./some-app'), // - an app
    //server: http.createServer(sth)  - http.Server instance
    //server: 'http://localhost:9000' - external

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
      ignore: ['_generatedOn', 'meta.validUntil[0]', // ignore changes to properties matching these JSON paths
       '$..id', '$.children[*].id'] // you can also use queries compatible with the 'jsonpath' npm module to
                                    // ignore multiple matching properties at once
    },

    // the HTTP fetcher can also be configured, both per-suite and per-test
    http: {
      timeout: 1000 // how longer (in ms) to wait for a response before failing the test, defaults to 2000ms
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

  // if you'd like to test something else than an HTTP server (or test a server in
  // a way we don't support yet), you can give Chaplain a promise, and it will treat
  // the value of this promise as the thing to test
  test('promise-test', function() {
    return runShell('ls -l').then(function(r) { return r.stdout; }); // one idea of what you could do
  });

  // you can still specify other options when using promises
  test('promise-test-2', {your: 'options'}, function() {});

  // if necessary, you can use before() and after() functions to set things up
  // before tests run, and tear them down once they are complete
  // both functions should return promises to indicate when setup is done
  before(function() {
    // you can use before to set external stuff stuff up
    return runShell('./testServer start');
  });
  before(function(suite) {
    // ...or to asynchronously configure the suite like this:
    suite.config({server: "http://localhost:" + aPort});
    suite.test('dynamically-added-test', {test: 'options'});
  });
  // after works just like before... but after :)
  after(function() {
    return runShell('./testServer stop');
  });
});

// you can have multiple suites, of course
suite('another-suite', function() {
  config({app: require('./different-app')});
  //...
});
