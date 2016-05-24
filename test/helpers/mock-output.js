/* jshint node: true, esversion: 6 */
"use strict";

export default function setupOutputMock() {
  let stdoutContents = "";
  let stderrContents = "";

  return {
    write(str) { stdoutContents += str; },
    writeError(str) { stderrContents += str; },
    
    stdout() { return stdoutContents; },
    stderr() { return stderrContents; }
  };
}
