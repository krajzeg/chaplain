/* jshint node: true, esversion: 6 */
"use strict";

import {inherits} from 'util';

export class UserFacingError extends Error {
  constructor(message) {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.name = 'UserFacingError';
    this.message = message;
    this.code = 'EUSERFACING';
  }
}
