/* jshint node: true, esversion: 6 */
"use strict";

import _ from 'lodash';
import chalk from 'chalk';
import util from 'util';

const COLOR_STYLES = {
  highlighted: (t) => chalk.bold.white(t),
  added:       (t) => chalk.green(t),
  removed:     (t) => chalk.red(t),
  changed:     (t) => chalk.yellow(t),
  bad:         (t) => chalk.red(t),

  heading:     (t) => {
    const padding = 78 - 8 - chalk.stripColor(t).length;
    return `====[ ${t} ` + ']' + '='.repeat(padding);
  },

  happy: (t) => chalk.bold.white('+[:-) ') + t,
  sad:   (t) => chalk.bold.red('+[:-( ') + t
};

export default function setupOutput(config) {
  const styles = COLOR_STYLES;
  return { log, logNoNewline, error, clear };

  // ===========================

  function log(...args) {
    process.stdout.write(prepareMessage(args) + "\n");
  }
  function logNoNewline(...args) {
    process.stdout.write(prepareMessage(args));
  }
  function error(...args) {
    process.stderr.write(prepareMessage(args) + "\n");
  }
  function clear() {
    if (process.stdout.isTTY)
      process.stdout.write('\u001bc');
  }

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
      const text = prepareMessage([_.values(fragment)[0]]);

      const style = styles[styleName];
      return style ? style(text) : text;
    } else if (fragment instanceof Array) {
      return prepareMessage([fragment]);
    } else {
      return (fragment && fragment.toString) ? fragment.toString() : util.inspect(fragment);
    }
  }
}
