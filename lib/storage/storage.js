/* jshint node: true, esversion: 6 */
"use strict";

import Promise from 'bluebird';
import path from 'path';

export default function setupStorage(config) {
  const fs = Promise.promisifyAll(config.fs || require('fs'));

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

      return exists(storageDir())
        .then(storageExists => {
          if (!storageExists) {
            return fs.mkdirAsync(storageDir(), 7 * 64 + 5 * 8 + 5 /* owner r+w+x, rest r+x */);
          }
        }).then(() => {
          return fs.writeFileAsync(file, contents, {mode: 6 * 64 + 4 * 8 + 4 /*owner:rw, rest:r*/});
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
