/* jshint node: true, esversion: 6 */
"use strict";

import _ from 'lodash';
import path from 'path';

export default function makeTestEnvironment(testFilePath) {
  let suites = [], currentSuite;

  // proxy methods that will refer to whatever suite is current
  const before = createSuiteContextProxy('before');
  const after = createSuiteContextProxy('after');
  const config = createSuiteContextProxy('config');
  const test = createSuiteContextProxy('test');

  return {createSandbox, suites};

  // ================================================

  function createSuiteContextProxy(name) {
    return (...args) => {
      if (!currentSuite)
        throw new Error(`${name}() can only be used in the context of a suite.`);
      return currentSuite.context[name].apply(currentSuite.context, args);
    };
  }

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

    // create a basic set of globals
    let globals = {
      require: sandboxRequire, // hacked require() that will work from inside the testfile
      exports: {}, // exports are not used by us, but we might define them anyway
      module: {exports: {}},
      __dirname: testDir, // __dirname and __filename set to the testfile
      __filename: testBasename,
      process, // let it access the process for stuff like .cwd()
      
      // include the global function we want to have
      suite, config, test, before, after
    };

    // add self-reference so global.blah works
    globals.global = globals;

    // done!
    return globals;
  }

  function suite(name, fn) {
    currentSuite = {name, tests: []};
    currentSuite.context = new SuiteContext(currentSuite);

    fn();

    suites.push(currentSuite);
    currentSuite = undefined;
  }
}

// Each suite has a SuiteContext, which exposes the real implementation
// of the methods like config(), before(), test(), etc.
// This means that we can give this context out to user-provided methods
// and let configuration happen from there, without 'currentSuite' being
// a problem for async.
export class SuiteContext {
  constructor(suite) {
    this.suite = suite;
  }

  config(obj) {
    if (typeof obj != 'object')
      throw new Error("config() should be called like this: config({prop: .., prop: ..}).");
    _.extend(this.suite, obj);
  }

  before(fn) {
    this.suite.befores =
      (this.suite.befores || []).concat([fn]);
  }

  after(fn) {
    this.suite.afters =
      (this.suite.afters || []).concat([fn]);
  }

  test(name, objOrFn, fn) {
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
    this.suite.tests.push(test);

    function invalid() {
      throw new Error("test() should be called in one of these ways:\n" +
        "  test('name', {...test config...})\n" +
        "  test('name', source function)\n" +
        "  test('name', {...test config...}, source function)\n"
      );
    }
  }
}
