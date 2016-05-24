/* jshint node: true, esversion: 6 */
"use strict";

import Promise from 'bluebird';
import _ from 'lodash';
import path from 'path';
import createMockFileSystem from './mock-fs';

const fs = Promise.promisifyAll(require('fs'));
// this is to cope with an issue in mock-fs:
// https://github.com/tschaub/mock-fs/issues/103
// and can be removed when this is fixed
const fsReaddir = fs.readdir.bind(fs);
const fsReaddirAsync = Promise.promisify(fsReaddir);

export function createFilesForMockFS(realDirectory) {
  return fsReaddirAsync(realDirectory)
    .then(filenames => {
      return Promise.all(filenames.map(name => {
        const mockFilename = path.resolve(process.cwd(), name);
        return fs.readFileAsync(path.resolve(realDirectory, name))
          .then(contents => [mockFilename, contents.toString()]);
      }));
    }).then((pairs) => createMockFileSystem(_.object(pairs)));
}
