/* jshint node: true, esversion: 6 */
"use strict";

import Promise from 'bluebird';
import path from 'path';

export default function setupStorage(config) {
  const fs = Promise.promisifyAll(config.fs || require('fs'));
  const mkdirpAsync = Promise.promisify(require('mkdirp'));

  return {
    fetch(test) {
      const file = fileName(test);

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

    store(test, object) {
      const file = fileName(test);
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

  function fileName(test) {
    let fullName = [test.suite.name, test.name].join('.');
    fullName = fullName
      .replace(/ /g, '_')
      .replace(/[^a-zA-Z0-9_.-]/g, (char) => {
        const codePoint = char.codePointAt(0).toString(16);
        return `-${codePoint}-`;
      });

    return path.join(storageDir(), `${fullName}.json`);
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
