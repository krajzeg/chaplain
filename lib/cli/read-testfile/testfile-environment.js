/* jshint node: true, esversion: 6 */
"use strict";

import _ from 'lodash';
import path from 'path';

export default function makeTestEnvironment(testFilePath) {
  let suites = [], currentSuite;

  return {createSandbox, suites};

  // ================================================

  function createSandbox() {
    const testDir = path.resolve(path.dirname(testFilePath)),
      testBasename = path.basename(testFilePath);

    const sandboxRequire = (id) => {
      // correct relative paths to be relative to testfile
      if (id.startsWith('.')) {
        id = path.resolve(testDir, id);
      }
      // use our own require otherwise
      return require(id);
    };

    const globals = {
      suite, config, test, // definition methods
      require: sandboxRequire, // hacked require() that will work from inside the testfile
      exports: {}, // exports are not used by us, but we might define them anyway
      module: {exports: {}},
      __dirname: testDir, // __dirname and __filename set to the testfile
      __filename: testBasename
    };
    globals.global = globals;
    return globals;
  }

  function suite(name, fn) {
    currentSuite = {name, tests: []};
    fn();
    suites.push(currentSuite);
    currentSuite = undefined;
  }

  function config(obj) {
    if (!currentSuite)
      throw new Error("config() can only be used in the context of a suite.");
    if (typeof obj != 'object')
      throw new Error("config() should be called like this: config({prop: .., prop: ..}).");

    _.extend(currentSuite, obj);
  }

  function test(name, objOrFn, fn) {
    if (!currentSuite)
      throw new Error("test() can only be used in the context of a suite.");

    // various ways to call this:
    // test('name', () => {...})
    // test('name', { ... })
    // test('name', { ... }, ()=>{...})
    if (typeof name != 'string') {
      invalid();
    }
    let testSetup;
    if (typeof objOrFn == 'function' && fn === undefined) {
      testSetup = {fn: objOrFn};
    } else if (typeof objOrFn == 'object') {
      if (typeof fn == 'function') {
        testSetup = _.extend({}, objOrFn, {fn});
      } else if (fn === undefined) {
        testSetup = objOrFn;
      } else {
        invalid();
      }
    } else {
      invalid();
    }
    const test = _.extend({name}, testSetup);
    currentSuite.tests.push(test);

    function invalid() {
      throw new Error("test() should be called in one of these ways:\n" +
          "  test('name', {...test config...})\n" +
          "  test('name', source function)\n" +
          "  test('name', {...test config...}, source function)\n"
      );
    }
  }
}

