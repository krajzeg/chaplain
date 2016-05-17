/* jshint node: true, esversion: 6 */
"use strict";

import {UserFacingError} from '../errors';
import path from 'path';

export default function readSuite(suiteFile) {
  return Promise.resolve().then(() => {
    try {
      // create a fully qualified path to the module
      const modulePath = path.join(process.cwd(), suiteFile).replace(/\\/g, '/');
      // require it and evaluate to get the suite
      let suite = require(modulePath);
      if (typeof suite === 'function') {
        suite = suite();
      }
      // done!
      return suite;

    } catch(err) {
      // something went wrong, let's try and give the user the best info we have
      if (err.code == 'MODULE_NOT_FOUND') {
        // file missing
        throw new UserFacingError(["Your ", {highlighted: suiteFile}, " test file seems to be missing."]);
      } else {
        // syntax or runtime error in the testsuite JS, can't do much
        throw new UserFacingError([
          "Your ", {highlighted: suiteFile}, ` test file failed to parse: ${err.message}`
        ]);
      }
    }
  });
}
