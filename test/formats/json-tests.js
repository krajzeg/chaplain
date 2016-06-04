/* jshint node: true, esversion: 6 */
"use strict";

import json from '../../lib/plugins/format-json';
import setupOutput from '../../lib/cli/output';
import {assert} from 'chai';

describe("JSON diff", () => {
  const out = setupOutput({color: false}, null, null);

  it("should return no changes for equal objects", () => {
    const j = json.create({},{});
    const obj1 = {a: [1,2], b: {c: "3", d: true}};
    const obj2 = JSON.parse(JSON.stringify(obj1));

    assert.lengthOf(j.compare(obj1, obj2), 0);
  });

  it("should handle JSON passed as a string", () => {
    const j = json.create({}, {});
    const obj1 = '{"a": "Hi"}';
    const obj2 = '{"a": "Hi"}';
    assert.lengthOf(j.compare(obj1, obj2), 0);
  });

  it("should detect changes correctly in objects", () => {
    const j = json.create({}, {});
    const expected = {a: [1,2,3], b: 42, c: true};
    const actual = {a: [1,2,4,5], b: 46, d: false};

    const result = j.compare(actual, expected);
    assert.lengthOf(result, 1);
    const msg = out.prepareMessage(result[0].message);

    assert.ok(msg.includes("This is how your JSON changed"));
    assert.ok(msg.includes('b: 42 -> 46'));
    assert.ok(msg.includes('-c: true'));
    assert.ok(msg.includes('+d: false'));
    assert.ok(msg.includes('-[2]: 3'));
    assert.ok(msg.includes('+[2]: 4'));
    assert.ok(msg.includes('+[3]: 5'));
  });

  it("should handle ignores correctly", () => {
    const j = json.create({}, {json: {ignore: [
      "..id", "meta", "$.elements[1].name", "$.wont.match.anything"
    ]}});
    const expected = {
      meta: "one",
      elements: [
        {id: "a", name: "Alfred"},
        {id: "b", name: "Bob"}
      ]
    };
    const actual = {
      meta: "two",
      elements: [
        {id: "aa", name: "Alfred"},
        {id: "bb", name: "Betty"}
      ]
    };

    assert.deepEqual(j.compare(actual, expected), []);
  });

  it("should still detect a property disappearing even if ignored", () => {
    const j = json.create({}, {json: {ignore: [
      'disappearing'
    ]}});
    const result = j.compare({}, {disappearing: true});
    assert.lengthOf(result, 1);
  });

  it("should show a friendly error when JSON doesn't parse", () => {
    const j = json.create({}, {});
    const err = grabException(() => {
      j.compare('{"hi": [1,2,3,"whoops!', {});
    });

    assert.ok(err);
    assert.equal(err.code, 'EUSERFACING');
    assert.ok(out.prepareMessage(err.message).startsWith("Your output was supposed to be JSON, but it doesn't parse:\n"));
  });

  it("should show a friendly error on bad ignore paths", () => {
    const err = grabException(() => {
      json.create({}, {json: {ignore: [
        "$.dangling["
      ]}});
    });

    assert.ok(err);
    assert.equal(err.code, 'EUSERFACING');
    assert.ok(out.prepareMessage(err.message).startsWith("The JSON path you specified: '$.dangling[' failed to parse:\n"));
  });
});

function grabException(fn) {
  try { fn(); } catch(e) { return e; }
  return undefined;
}
