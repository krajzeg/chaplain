/* jshint node: true, esversion: 6 */
"use strict";

const ICON = {
  ok: '.',
  'new': {added: '+'},
  'changed': {changed: '?'},
  'key props changed': {changed: '?'},
  'error': {bad: '!'},
  'exception': {bad: '!'}
};

export default function setupCallbacks(output) {
  return {
    run: {
      testFinished(test, result) {
        output.logNoNewline(ICON[result.status] || '.');
      }
    },

    bless: {
      testBlessed(test) {
        output.log(`      ${test.key()}: blessed`);
      }
    }
  };
}
