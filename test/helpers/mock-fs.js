/* jshint node: true, esversion: 6 */
"use strict";

// Enough of a mock for our purposes:
// supports:
//   readFile,
//   writeFile,
//   stat - but the Stats are useless, useful only for checking file existence
//   mkdir
// Quick-and-dirty, but still more predictable than mock-fs :[

import fs from 'fs';
import _ from 'lodash';
import path from 'path';

// The constructor takes a map of 'absolute filename' => 'file contents as string'
export default function createMockFilesystem(files) {
  // this will store our files
  let filesystem = {};
  // these are the supported operations
  const fsObject = {
    readFile, writeFile, stat, mkdir, getFileContents
  };

  // return a Promise for the FS
  return resolveFileList(files)
    .then(resolved => filesystem = resolved)
    .then(() => fsObject);

  // ======================================================================

  function getFileContents(path) {
    path = resolve(path);
    return filesystem[path];
  }

  function readFile(filePath, callback) {
    const file = _.get(filesystem, resolve(filePath));
    if (!file) {
      callback({code: 'ENOENT', message: "File not found."});
    } else if (typeof file == 'object') {
      callback({code: 'EISDIR', message: "This is a directory."});
    } else {
      callback(null, new Buffer(file));
    }
  }

  function writeFile(filePath, contents, options = {}, callback) {
    _.set(filesystem, resolve(filePath), contents);
    callback(null);
  }

  function mkdir(dirPath, options = {}, callback) {
    const fsPath = resolve(dirPath);
    const file = _.get(filesystem, fsPath);
    if (file) {
      callback({code: 'EEXIST', message: 'File already exists.'});
    } else {
      _.set(filesystem, fsPath, {});
      callback(null);
    }
  }

  function stat(filePath, callback) {
    const file = _.get(filesystem, resolve(filePath));
    if (file) {
      const stats = new fs.Stats();
      stats.mode = (typeof file == 'object') ? 16877 : 33188;
      callback(null, stats);
    } else {
      callback({code: 'ENOENT', message: 'File not found.'});
    }
  }

  function resolve(filePath) {
    const resolvedPath = path.resolve(process.cwd(), filePath);
    return resolvedPath.split(path.sep);
  }

  function resolveFileList(files) {
    if (typeof files == 'object') {
      return Promise.resolve(files);
    } else if (typeof files == 'string') {
      const realFSDirectory = files;
      const resolvedFiles = {};
      return fs.readdirAsync(realFSDirectory)
        .then(filenames => {
          return Promise.all(filenames.map(name => {
            const mockPath = resolve(name);
            return fs.readFileAsync(path.resolve(realFSDirectory, name))
              .then(contents => _.set(resolvedFiles, mockPath, contents.toString()));
          }));
        }).then(() => resolvedFiles);
    }
  }
}
