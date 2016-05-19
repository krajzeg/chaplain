/* jshint node: true, esversion: 6 */
"use strict";

import Promise from 'bluebird';
import path from 'path';

export default function setupStorage(config) {
  const fs = Promise.promisifyAll(config.fs || require('fs'));
  const mkdirpAsync = Promise.promisify(require('mkdirp'));

  return {
    fetch(testName) {
      const file = fileName(testName);

      // check if the file exists
      return exists(file)
        .then(exists => {
          if (exists) {
            // it does exist, read it!
            return fs.readFileAsync(file)
              .then(content => JSON.parse(content.toString()));
          } else {
            // the file doesn't exist, just return null
            return null;
          }
        });
    },

    store(testName, object) {
      const file = fileName(testName);
      const contents = JSON.stringify(object, null, 2);

      return mkdirpAsync(storageDir(), {mode: 0o755, fs: config.fs})
        .then(() => {
          return fs.writeFileAsync(file, contents, {mode: 0o644 /*owner:rw, rest:r*/});
        });
    }
  };

  function storageDir() {
    if (!config.storageDir)
      throw new Error("'storageDir' is a required option to set up storage.");
    return config.storageDir;
  }

  function fileName(testName) {
    return path.join(storageDir(), `${testName}.json`);
  }

  function exists(fileName) {
    return fs.statAsync(fileName)
      .then(() => true)
      .catch(err => {
        if (err.code == 'ENOENT') return false;
        throw err;
      });
  }
}
