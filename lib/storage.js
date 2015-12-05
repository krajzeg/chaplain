/* jshint node: true, esversion: 6 */
"use strict";

let path = require('path');
let BB = require('bluebird');
let fs = BB.promisifyAll(require('fs'));

export class Storage {
  constructor(storageDirectory = undefined) {
    this.dir = storageDirectory || getDefaultDir();
  }

  // Stores a blessed output file for a given test.
  blessOutput(testName, output) {
    let file = this.outputFileName(testName);
    return fs.writeFileAsync(file, JSON.stringify(output));
  }

  // Gets the stored, blessed output for a test.
  // Returns a promise that will resolve to the blessed output
  // or `undefined` if no blessed output exists.
  getBlessedOutput(testName) {
    let file = this.outputFileName(testName);

    // try and read the file
    return fs.readFileAsync(file).then((buffer) => {
      return JSON.parse(buffer.toString());
    }).catch((err) => {
      if (err.code == 'ENOENT') {
        // if the file wasn't there, too bad - not an error
        return undefined;
      } else {
        // other errors get rethrown
        throw err;
      }
    });
  }

  // Picks a file name to store the blessed output of a test in.
  outputFileName(testName) {
    return path.join(this.dir, `${testName}.blessed`);
  }

}

function getDefaultDir() {
  return path.join(process.cwd(), ".vicar");
}
