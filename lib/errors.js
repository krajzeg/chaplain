/* jshint node: true, esversion: 6 */
"use strict";

// Special class for errors that contain a user-facing message,
// and that message should be shown instead of a stacktrace.
export class UserFacingError extends Error {
  constructor(message) {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.name = 'UserFacingError';
    this.message = message;
    this.code = 'EUSERFACING';
  }
}

// If this type of error is ever thrown, the entire application
// should quit with process.exit(), using the exitCode from
// the exception.
export class TerminationError extends Error {
  constructor(exitCode, message) {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.name = 'TerminationError';
    this.exitCode = exitCode;
    this.message = message;
    this.code = 'ETERMINATION';
  }
}
