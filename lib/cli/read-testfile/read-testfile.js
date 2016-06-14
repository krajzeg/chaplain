/* jshint node: true, esversion: 6 */
"use strict";

import Promise from 'bluebird';
import vm from 'vm';

import makeTestfileEnvironment from './testfile-environment';
import {UserFacingError} from '../../errors';

export default function readTestFile(fs, testFilePath) {
  fs = Promise.promisifyAll(fs);

  return readRawContents(fs, testFilePath)
    .then(contents => parseTestFile(testFilePath, contents))
    .catch(err => {
      if (err.code != 'EUSERFACING') {
        throw new UserFacingError([
          "Your testfile - ", {highlighted: testFilePath}, " failed to parse:\n",
          err.stack || err
        ]);
      } else {
        throw err;
      }
    });
}

function readRawContents(fs, testFilePath) {
  return fs.readFileAsync(testFilePath)
    .then(buffer => buffer.toString())
    .catch(err => {
      if (err.code == 'ENOENT') {
        throw new UserFacingError(["It seems your testfile: ", {highlighted: testFilePath}, " is missing."]);
      } else {
        throw err;
      }
    });
}


function parseTestFile(testFilePath, testFileCode) {
  // compile the test file
  const script = new vm.Script(testFileCode, {
    filename: testFilePath,
    displayErrors: true
  });

  // create the environment we will run the testfile in
  const env = makeTestfileEnvironment(testFilePath);

  // run the testfile in our fake context
  const context = vm.createContext(env.createSandbox());
  script.runInContext(context, {
    filename: testFilePath,
    displayErrors: process.env.CHAPLAIN_TEST != 'true'
  });

  // done!
  return env.suites;
}
