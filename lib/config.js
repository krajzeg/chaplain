/* jshint node: true, esversion: 6 */
"use strict";

import _ from 'lodash';
import path from 'path';

export const DEFAULT_CONFIG = {
  storageDir: path.join(process.cwd(), '.chaplain'),
  onlyTestsMatching: '.*',

  plugins: [],
  contentTypes: {},

  fs: require('fs')
};
export const STANDARD_PLUGINS = [
  require('./plugins/std-http-server'),
  require('./plugins/std-no-console-log'),

  require('./plugins/source-http'),
  require('./plugins/source-function'),

  require('./plugins/pickup-http-response'),
  require('./plugins/pickup-json'),
  require('./plugins/pickup-to-string'),

  require('./plugins/format-json'),
  require('./plugins/format-html'),
  require('./plugins/format-text')
];
export const STANDARD_CALLBACKS = {
  testStarted: () => {},
  testFinished: () => {},
  testBlessed: () => {}
};

export function prepareConfig(suite, cfg) {
  // merge suite keys and the passed config (usually CLI-driven)
  cfg = _.extend({}, suite, cfg);

  // apply defaults and cut extraneous keys out
  cfg = _.defaults(cfg, DEFAULT_CONFIG);
  cfg = _.pick(cfg, _.keys(DEFAULT_CONFIG));

  // fix up some of the more complex fields
  cfg.plugins = cfg.plugins.concat(STANDARD_PLUGINS);

  return cfg;
}

export function prepareCallbacks(callbacks) {
  return _.defaults(callbacks || {}, STANDARD_CALLBACKS);
}
