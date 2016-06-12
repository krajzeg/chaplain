/* jshint node: true, esversion: 6 */
"use strict";

export class ChaplainTest {
  constructor(suite, spec) {
    this.suite = suite;
    Object.assign(this, spec);
  }

  key() {
    return [this.suite ? this.suite.name : '', this.name].join(':');
  }
}
