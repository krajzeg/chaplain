/* jshint node: true, esversion: 6 */
"use strict";

let path = require('path');
let del = require('del');
let BB = require('bluebird');
let fs = BB.promisifyAll(require('fs'));

export const SCRATCH_DIR = '.scratch';

export function cleanScratch() {
  return del(SCRATCH_DIR).then(() => {
    return fs.mkdirAsync(SCRATCH_DIR);
  });
}

export function writeFileToScratch(name, contents) {
  fs.writeFileAsync(path.join(SCRATCH_DIR, name), contents);
}
