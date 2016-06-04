/* jshint node: true, esversion: 6 */
"use strict";

import _ from 'lodash';
import hiff from 'hiff';
import util from 'util';

module.exports = {
  plugin:   'format',
  mimeTypes: ['text/html'],

  create(config, test) {
    const hiffOptions = _.extend({}, config.html, test.html);
    return {
      compare(actual, expected) {
        const result = hiff.compare(expected, actual, hiffOptions);
        if (!result.different) {
          return [];
        } else {
          return result.changes.map(ch => {
            return {message: renderChange(ch)};
          });
        }
      }
    };
  }
};

const CHANGE_INTROS = {
  added:   (c) => ({added: `Added in ${c.after.parentPath}:\n`}),
  removed: (c) => ({removed: `Removed in ${c.before.parentPath}:\n`}),
  changed: (c) => {
    if (c.before.$node[0].type == 'text') {
      return {changed: `Text changed inside ${c.before.parentPath}:\n`};
    } else {
      return {changed: `Changes in ${c.before.path}:\n`};
    }
  }
};
function renderChange(change) {
  let introText = CHANGE_INTROS[change.type](change);
  let strippedMessage = change.message.replace(/^.*?:/, '').trim();

  return [introText, strippedMessage];
}
