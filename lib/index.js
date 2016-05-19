/* jshint node: true, esversion: 6 */
"use strict";

import _ from 'lodash';
import Promise from 'bluebird';
import setupStorage from './storage/storage';
import {prepareConfig, prepareCallbacks} from './config';

export default function setupChaplain(suite, config) {
  // merge our configuration sources to get a final config
  config = prepareConfig(suite, config);

  // collect all the relevant setup/teardown plugins
  // this means plugins that were triggered by a property
  // somewhere in our suite configuration
  const setupTeardowns = config.plugins
    .filter(p => p.plugin == 'setup-teardown')
    .filter(p => pluginTriggered(p, suite))
    .map(p => p.create(suite));

  // find the other plugins, but don't instantiate them yet
  // (they are instantiated per-test, not per-suite)
  const sourcePlugins = config.plugins.filter(p => p.plugin == 'source');
  const formatPlugins = config.plugins.filter(p => p.plugin == 'format');

  // initialize our blessed content storage
  const blessedStore = setupStorage(config);

  // filter out the tests we really want to process (mostly used for blessing)
  const testRegex = new RegExp(config.onlyTestsMatching);
  const tests = suite.tests.filter(t => t.name.match(testRegex));

  // returns a properly set-up chaplain object
  return {
    runSuite,
    blessSuite,
    blessTest
  };

  // =====================================================================

  function runSuite(callbacks) {
    callbacks = prepareCallbacks(callbacks);
    let context = {};

    return performSetup(context)
      .then(() => runAllTests(tests, callbacks, context))
      .then(individualResults => ({
        results: individualResults,
        success: !_.any(individualResults, r => r.status != 'ok')
      }))
      .finally(() => performTeardown(context));
  }

  function blessSuite(callbacks) {
    return runSuite(callbacks)
      .then(({results}) => {
        return Promise.all(tests.map(t => {
          return blessTest(t.name, results[t.name].actual)
            .then(() => callbacks.testBlessed(t))
            .then(() => t.name);
        }));
      });
  }

  function runAllTests(tests, callbacks, context) {
    const resultPromises = tests.map(test => {
      callbacks.testStarted(test);

      return runTest(test, context)
        .then(result => {
          callbacks.testFinished(test, result);
          return [test.name, result];
        }).catch(err => {
          if (err.code == 'EUSERFACING') {
            return [test.name, {
              status: 'error',
              message: err.message
            }];
          } else {
            return [test.name, {
              status: 'exception',
              exception: err,
              message: [
                err.message + "\n",
                (err.stack || err),
                "\n\nPlease report this issue here: ",
                {highlighted: "https://github.com/krajzeg/chaplain/issues"}
              ]
            }];
          }
        });
    });

    return Promise.all(resultPromises).then(_.object);
  }

  function runTest(test, context) {
    // find the source plugin that will let us fetch data
    const sourcePlugin = _.find(sourcePlugins, p => pluginTriggered(p, test));
    if (!sourcePlugin) {
      return Promise.resolve({
        status: 'error',
        message: [
            `No source could be identified for test `,
            {highlighted: test.name},
            `.\nPlease specify at least one of the following properties:\n\t`,
            [].concat.apply([], sourcePlugins.map(p => p.triggers)).join(', ')
        ]
      });
    }
    const source = sourcePlugin.create(suite, test);

    // fetch the actual data from the source and our stored, "blessed" version
    return Promise.all([source.fetch(context), blessedStore.fetch(test.name)])
      .then(([actual, blessed]) => {
        if (!blessed) {
          // we don't have any blessed content yet - must be a new test
          return {status: 'new', actual, blessed};
        }

        // compare types - if they're not the same, we have no basis for comparison
        const [mimeType, blessedType] = [actual.props.mimeType, blessed.props.mimeType];
        if (mimeType != blessedType) {
          return {
            status: 'mime type changed',
            message: `The type of data returned from your test changed from ${blessedType} to ${mimeType}.`,
            actual, blessed
          };
        }

        // find the right format to use
        let formatPlugin = _.find(formatPlugins, p => p.mimeTypes.indexOf(mimeType) >= 0);
        if (!formatPlugin) {
          // fallback to a generic format (text/plain, by default)
          formatPlugin = _.find(formatPlugin, p => p.mimeTypes.indexOf('*') >= 0);
        }
        const format = formatPlugin.create(suite, test);

        // compare using the format
        const changes = format.compare(actual.value, blessed.value, context);

        // return final verdict
        if (changes.length > 0) {
          return {status: 'changed', actual, blessed, changes};
        } else {
          return {status: 'ok', actual, blessed};
        }
      });
  }

  function blessTest(testName, blessedContents) {
    return blessedStore.store(testName, blessedContents);
  }

  function performSetup(context) {
    return Promise.all(setupTeardowns.map(plugin =>
        plugin.setup(context)
    ));
  }

  function performTeardown(context) {
    return Promise.all(setupTeardowns.map(plugins =>
        plugins.teardown(context)
    ));
  }

  // Plugins trigger when one of their 'trigger' properties
  // is found on the config/test object.
  function pluginTriggered(plugin, triggerObject) {
    // Some plugins have a 'triggers: true' setting which means
    // they always trigger.
    if (plugin.triggers === true) return true;
    // check if any of the trigger props is present on triggerObject
    return _.intersection(plugin.triggers || [], _.keys(triggerObject)).length > 0;
  }
}
