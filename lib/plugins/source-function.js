/* jshint node: true, esversion: 6 */
"use strict";

import {UserFacingError} from '../errors';

module.exports = {
  plugin: 'source',
  triggers: ['fn'],

  create(config, test) {
    const {fn} = test;

    return {
      fetch(context) {
        return Promise.resolve()
          .then(() => fn())
          .then((result) => {
            return {
              value: result.toString(),
              keyProps: {}
            };
          })
          .catch(err => {
            throw new UserFacingError([
              {highlighted: "The function you gave for this test threw an error:\n"},
              (err.stack || err)
            ]);
          });
      },

      description() {
        return `custom: ${fn.toString.split("\n", 1)[0]}`;
      }
    };
  }
};
