/* jshint node: true, esversion: 6 */
"use strict";

import cliEngine from '../../lib/cli/cli-engine';
import mockOutput from './mock-output';
import {createFilesForMockFS} from './mock-files';

export function setupTestCLI({args = ['-IC'], files = {}}) {
  const out = mockOutput();

  let resolveFileMap;
  if (typeof files == 'string') {
    resolveFileMap = createFilesForMockFS(files);
  } else {
    resolveFileMap = Promise.resolve(files || {});
  }

  return resolveFileMap
    .then(fileMap => {
      const cli = cliEngine({
        argv: ['node', 'chaplain-cli.js'].concat(args),
        fs: require('mock-fs').fs(fileMap),

        write: out.write.bind(out),
        writeError: out.writeError.bind(out),
        isTTY: false
      });
      return {cli, out};
    });
}
