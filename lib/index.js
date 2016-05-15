/* jshint node: true, esversion: 6 */
"use strict";

import _ from 'lodash';
import Promise from 'bluebird';
import setupStorage from './storage/storage';
import {sanitizeConfig, sanitizeCallbacks} from './config';

export default function setupChaplain(suite) {
  const config = sanitizeConfig(suite);

  // collect all the relevant setup/teardown plugins
  // this means plugins that were triggered by a property
  // somewhere in our suite configuration
  const setupTeardowns = config.plugins
    .filter(p => p.plugin == 'setup-teardown')
    .filter(p => _.intersection(p.triggers, _.keys(suite)).length > 0)
    .map(p => p.create(suite));
  const sourcePlugins = config.plugins.filter(p => p.plugin == 'source');
  const formatPlugins = config.plugins.filter(p => p.plugin == 'format');

  // initialize our blessed content storage
  const blessedStore = setupStorage(config);

  // returns a properly setup chaplain object
  return {
    runSuite
  };

  function runSuite(callbacks) {
    callbacks = sanitizeCallbacks(callbacks);

    return performSetup()
      .then(() => runAllTests(suite.tests, callbacks))
      .then(individualResults => ({
        results: individualResults,
        success: !_.any(individualResults, r => r.status != 'ok')
      }))
      .finally(performTeardown);
  }


  function performSetup() {
    return Promise.all(setupTeardowns.map(plugin =>
        plugin.setup()
    ));
  }

  function runAllTests(tests, callbacks) {
    const resultPromises = tests.map(test => {
      callbacks.testStarted(test);

      return runTest(test)
        .then(result => {
          callbacks.testFinished(test, result);
          return [test.name, result];
        }).catch(err => {
          return [test.name, {status: 'exception', exception: err, message: err.message}];
        });
    });

    return Promise.all(resultPromises).then(_.object);
  }

  function runTest(test) {
    // find the source plugin that will let us fetch data
    const sourcePlugin = _.find(sourcePlugins, p =>
      _.intersection(p.triggers, _.keys(test)).length > 0
    );
    if (!sourcePlugin) {
      return Promise.resolve({
        status: 'no source',
        message: `No source could be identified for test ${test.name}.\nPlease specify one of the following properties:\n` +
          [].concat.apply([], sourcePlugins.map(p => p.triggers)).join(', ')
      });
    }
    const source = sourcePlugin.create(suite, test);

    // fetch the actual data from the source and our stored, "blessed" version
    return Promise.all([source.fetch(), blessedStore.fetch(test.name)])
      .then((actual, blessed) => {
        if (!blessed) {
          // we don't have any blessed content yet - must be a new test
          return {status: 'new'};
        }
        return {status: 'ok'};
      });
  }

  function performTeardown() {
    return Promise.all(setupTeardowns.map(plugins =>
        plugins.teardown()
    ));
  }
}
