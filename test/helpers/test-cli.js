/* jshint node: true, esversion: 6 */
"use strict";

import cliEngine from '../../lib/cli/cli-engine';
import mockOutput from './mock-output';
import mockPrompt from './mock-prompt';
import createMockFS from './mock-fs';

export function setupTestCLI({args = ['-IC'], files = {}, promptAnswers = [], fs}) {
  const out = mockOutput();
  const prompt = mockPrompt(promptAnswers);

  const whenFSCreated = fs ? Promise.resolve(fs) : createMockFS(files);

  return whenFSCreated
    .then(mockFS => {
      const cli = cliEngine({
        argv: ['node', 'chaplain-cli.js'].concat(args),
        fs: mockFS,

        prompt: prompt,

        write: out.write.bind(out),
        writeError: out.writeError.bind(out),
        isTTY: false
      });
      return {cli, out, prompt, fs: mockFS};
    });
}

export function runCLITest(parameters) {
  let cli, out, fs, prompt;

  return setupTestCLI(parameters)
    .then(t => { cli = t.cli; out = t.out; prompt = t.prompt; fs = t.fs; })
    .then(() => cli.run())
    .then(exitCode => {
      if (!prompt.exhausted()) {
        throw new Error("Not all answers given to the prompt mock have been used.");
      }
      return {
        exitCode,

        fs,

        stdout: out.stdout(),
        stderr: out.stderr(),
        output: out.allOutput()
      };
    });
}

export function runCLIAndGetOutput(parameters) {
  return runCLITest(parameters).then(({output}) => output);
}
