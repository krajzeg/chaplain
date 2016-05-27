/* jshint node: true, esversion: 6 */
"use strict";

import {assert} from 'chai';
import {createBeforeAfter} from "../../lib/steps/before-after-runner";
import expectRejection from "../helpers/expect-rejection";

describe("Before/after runner", () => {
  it("should cause no trouble with no befores/afters", () => {
    const ba = createBeforeAfter({});
    return ba.runBefores()
      .then(() => ba.runAfters());
  });

  it("should run befores/afters in order", () => {
    const context = {value: 7};
    const ba = createBeforeAfter({
      context,
      befores: [
        (ctx) => ctx.value *= 2,
        (ctx) => ctx.value += 2
      ],
      afters: [
        (ctx) => Promise.resolve(ctx.value += 4),
        (ctx) => ctx.value /= 4
      ]
    });

    return ba.runBefores()
      .then(() => {
        assert.equal(context.value, 16);
      })
      .then(ba.runAfters)
      .then(() => {
        assert.equal(context.value, 5);
      });
  });

  it("should wrap exceptions happening in callbacks", () => {
    const ba = createBeforeAfter({
      befores: [() => {
        throw new Error("Hi!");
      }]
    });
    return expectRejection(ba.runBefores())
      .then(err => assert.equal(err.code, 'EUSERFACING'));
  });
});
