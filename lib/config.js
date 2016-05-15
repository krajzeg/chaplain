/* jshint node: true, esversion: 6 */
"use strict";

import _ from 'lodash';
import path from 'path';

const DEFAULT_CONFIG = {
  plugins: [],
  storageDir: path.join(process.cwd(), '.chaplain')
};
const STANDARD_PLUGINS = [
  require('./plugins/std-http-server'),
  require('./plugins/source-http'),
  require('./plugins/format-text')
];
const STANDARD_CALLBACKS = {
  testStarted: () => {},
  testFinished: () => {}
};

export function sanitizeConfig(cfg) {
  cfg = _.defaults(cfg || {}, DEFAULT_CONFIG);
  cfg = _.pick(cfg, _.keys(DEFAULT_CONFIG));

  cfg.plugins = cfg.plugins.concat(STANDARD_PLUGINS);

  return cfg;
}

export function sanitizeCallbacks(callbacks) {
  return _.defaults(callbacks || {}, STANDARD_CALLBACKS);
}

