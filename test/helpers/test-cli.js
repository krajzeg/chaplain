/* jshint node: true, esversion: 6 */
"use strict";

import cliEngine from '../../lib/cli/cli-engine';
import mockOutput from './mock-output';
import mockFs from 'mock-fs';

export function setupTestCLI(files = {}) {
  const out = mockOutput();
  const cli = cliEngine({
    argv: ['node', 'chaplain-cli.js'],
    fs: mockFs.fs(files),

    write: out.write.bind(out),
    writeError: out.writeError.bind(out),
    isTTY: false
  });

  return {cli, out};
}
