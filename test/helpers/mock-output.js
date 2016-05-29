/* jshint node: true, esversion: 6 */
"use strict";

export default function setupOutputMock() {
  let stdoutContents = "";
  let stderrContents = "";
  let allContents = "";

  return {
    write(str) {
      stdoutContents += str;
      allContents += str;
    },
    writeError(str) {
      stderrContents += str;
      allContents += str;
    },

    stdout() { return stdoutContents; },
    stderr() { return stderrContents; },
    allOutput() { return allContents; }
  };
}
