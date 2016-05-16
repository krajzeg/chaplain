/* jshint node: true, esversion: 6 */
"use strict";

import _ from 'lodash';
import chalk from 'chalk';

const COLOR_STYLES = {
  highlighted: (t) => chalk.bold.white(t),
  added:       (t) => chalk.green(t),
  removed:     (t) => chalk.red(t),
  changed:     (t) => chalk.yellow(t),

  happy: (text) => chalk.bold.white('+:-) ') + text,
  sad:   (text) => chalk.bold.red('+:-( ') + text
};

export default function setupOutput(config) {
  const styles = COLOR_STYLES;
  return { log, error };

  // ===========================

  function log(...args) {
    console.log(prepareMessage(args));
  }
  function error(...args) { console.error(prepareMessage(args)); }

  function prepareMessage(args) {
    // join all our arguments into one long array
    const message = _.flatten(args.map(arg =>
      (arg instanceof Array) ? arg : [arg]
    ));

    // apply styles
    return message.map(applyStyleTo).join('');
  }

  function applyStyleTo(fragment) {
    if (typeof fragment == 'object' && _.size(fragment) == 1) {
      const styleName = _.keys(fragment)[0];
      const text = _.values(fragment)[0].toString();
      const style = styles[styleName];
      return style ? style(text) : text;
    } else {
      return fragment.toString();
    }
  }
}
