/* jshint node: true, esversion: 6 */
"use strict";

import _ from 'lodash';
import chalk from 'chalk';
import util from 'util';

// Styling when color is enabled.
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

// Styling when color is unavailable or disabled.
const NO_COLOR_STYLES = {
  highlighted: (t) => t,
  added:       (t) => `+${t}+`,
  removed:     (t) => `-${t}-`,
  changed:     (t) => t,
  bad:         (t) => t,

  heading:     (t) => {
    const padding = 78 - 8 - chalk.stripColor(t).length;
    return `====[ ${t} ` + ']' + '='.repeat(padding);
  },

  happy: (t) => '+[:-) ' + t,
  sad:   (t) => '+[:-( ' + t
};

export default function setupOutput(config, write, writeError) {
  const styles = config.color ? COLOR_STYLES : NO_COLOR_STYLES;

  // force chalk to be enabled if color output was chosen
  if (config.color) {
    chalk.enabled = true;
  }

  return { log, logNoNewline, error, clear };

  // ===========================

  function log(...args) {
    write(prepareMessage(args) + "\n");
  }
  function logNoNewline(...args) {
    write(prepareMessage(args));
  }
  function error(...args) {
    writeError(prepareMessage(args) + "\n");
  }
  function clear() {
    if (config.interactive)
      write('\u001bc');
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
    } else if (typeof fragment == 'string') {
      return config.color ? fragment : chalk.stripColor(fragment);
    } else {
      return (fragment && fragment.toString) ? fragment.toString() : util.inspect(fragment);
    }
  }
}
