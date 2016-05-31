/* jshint node: true, esversion: 6 */
"use strict";

import textFormat from '../../lib/plugins/format-text';
import setupOutput from '../../lib/cli/output';

import {assert} from 'chai';

describe("Text diff", () => {
  const out = setupOutput({color: false}, null, null);

  it("should return no changes for identical text", () => {
    const tf = textFormat.create({}, {});
    assert.deepEqual(tf.compare("Hello.", "Hello."), []);
  });

  it("should return correct changes for different text", () => {
    const before = "One Two\nThree Four\nFive Six\nSeven Eight";
    const after  = "One Two\nThree Pigs\nFive Six\nSeven Wonders";
    const tf = textFormat.create({}, {});

    const result = tf.compare(before, after);
    assert.lengthOf(result, 2);
    assert.equal(out.prepareMessage(result[0].message),
      "In line 2:\n" +
      "One Two\n" +
      "Three PigsFour\n" +
      "Five Six"
    );
    assert.equal(out.prepareMessage(result[1].message),
      "In line 4:\n" +
      "Five Six\n" +
      "Seven WondersEight"
    );
  });

  context("when using ignoreLines", () => {
    const before = "One Two\n@Three Four\n@Five Six\nSeven Eight\n@Nine Ten";
    const after  = "One Three\n@Something Else\nSeven Eight\n@And Here";
    const tf = textFormat.create({}, {
      text: {ignoreLines: '@.*'}
    });

    const result = tf.compare(before, after);

    it("should ignore the right things", () => {
      assert.lengthOf(result, 1);
    });
    it("should produce the right output for changes", () => {
      assert.equal(out.prepareMessage(result[0].message),
        "In line 1:\n" +
        "One ThreeTwo\n" +
        "<ignored>"
      );
    });
  });

  context("when using ignoreWords", () => {
    const before = "One @Two\nThree Four\nFive @Six @Seven\nEight Nine";
    const after = "One @Ten\nThree Four\nFive @Less\nEight Nein";
    const tf = textFormat.create({}, {
      text: {ignoreWords: '@.*'}
    });

    const result = tf.compare(before, after);

    it("should ignore the right things", () => {
      assert.lengthOf(result, 1);
    });
    it("should produce the right output for changes", () => {
      assert.equal(out.prepareMessage(result[0].message),
        "In line 4:\n" +
        "Five <ignored>\n" +
        "Eight NeinNine"
      );
    });
  });
});
