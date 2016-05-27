/* jshint node: true, esversion: 6 */
"use strict";

import _ from 'lodash';

export function createResultTransformer(config) {
  const plugins = config.plugins
    .filter(p => p.plugin == 'pickup')
    .map(p => p.create(config));


  return (result) => {
    // transform into unified result format
    if (!_.has(result, 'keyProps') || !_.has(result, 'value')) {
      result = {keyProps: {}, value: result};
    }

    return plugins.reduce((result, plugin) => {
      if (plugin.triggers(result)) {
        return plugin.transform(result);
      } else {
        return result;
      }
    }, result);
  };
}
