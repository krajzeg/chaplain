/* jshint node: true, esversion: 6 */
"use strict";

import Promise from 'bluebird';
import _ from 'lodash';
import {withTimeout, pluginTriggered} from "../utils";
import {UserFacingError} from "../errors";

export function createOutputFetcher(config, suite) {
  const sourcePlugins = config.plugins.filter(p => p.plugin == 'source');
  const timeout = config.timeout || 2000;

  return { fetchOutput };

  function fetchOutput(test, context) {
    return Promise.resolve()
      .then(() => test.source = pickAndInstantiatePlugin(test))
      .then(() => withTimeout(
        test.source.fetch(context),
        timeout,
        `Your test timed out - output was not available in ${timeout}ms.`));
  }

  function pickAndInstantiatePlugin(test) {
    const sourcePlugin = _.find(sourcePlugins, p => pluginTriggered(p, test));
    if (sourcePlugin) {
      return sourcePlugin.create(suite, test);
    } else {
      // no suitable plugin found
      throw new UserFacingError([
        `No source could be identified for test `,
        {highlighted: test.key()},
        `.\nPlease specify at least one of the following properties:\n\t`,
        [].concat.apply([], sourcePlugins.map(p => p.triggers)).join(', ')
      ]);
    }
  }
}
