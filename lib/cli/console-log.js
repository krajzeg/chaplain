/* jshint node: true, esversion: 6 */
"use strict";

const realLog = console.log;
const realErr = console.error;

export function disableConsoleLog() {
  console.log = () => {};
  console.error = () => {};
}
export function enableConsoleLog() {
  console.log = realLog;
  console.error = realErr;
}
