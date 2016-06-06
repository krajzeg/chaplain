/* jshint node: true, esversion: 6 */
"use strict";

import {assert} from 'chai';
import chalk from 'chalk';
import setupOutput from '../../lib/cli/output';

describe("Output module", () => {
  it("should correctly log with an without newline", () => {
    let written = "";
    const out = setupOutput({color: false}, (str) => written += str);
    out.log("Hello.");
    out.logNoNewline("Hi.");
    assert.equal(written, "Hello.\nHi.");
  });

  it("should log errors using writeErr()", () => {
    let written = "", errors = "";
    const out = setupOutput({color: false},
      (str) => written += str,
      (str) => errors += str);
    out.error("Argh!");
    assert.equal(errors, "Argh!\n");
    assert.equal(written, "");
  });

  it("should handle nested arguments correctly", () => {
    let written = "";
    const out = setupOutput({color: false}, (str) => written += str);
    out.log("Hello, ", ["this ", {highlighted: "is "}, "a ", [{highlighted: "message."}]]);
    assert.equal(written, "Hello, this is a message.\n");
  });

  it("should apply all styles correctly", () => {
    let written = "";
    const out = setupOutput({color: false}, (str) => written += str);
    out.log({added: "Added."});
    out.log({removed: "Removed."});
    out.log({changed: "Changed."});
    out.log({highlighted: "Highlighted."});
    out.log({bad: "Bad."});
    out.log({heading: "Heading."});
    out.log({happy: "Happy."});
    out.log({sad: "Sad."});
    assert.equal(written, "" +
      "Added.\nRemoved.\nChanged.\nHighlighted.\nBad.\n" +
      "====[ Heading. ]" + '='.repeat(62) + "\n" +
      "+[:-) Happy.\n+[:-( Sad.\n");
  });

  it("should not break on long headings", () => {
    let written = "";
    const out = setupOutput({color: false}, (str) => written += str);
    out.log({heading: "This is an extremely long heading.".repeat(4)});
    assert.equal(written, "====[ " + "This is an extremely long heading.".repeat(4) + " ]====\n");
  });

  context("when using color", () => {
    it("should handle nested arguments correctly", () => {
      let written = "";
      const out = setupOutput({color: true}, (str) => written += str);
      out.log("Hello, ", ["this ", {highlighted: "is "}, "a ", [{highlighted: "message."}]]);
      assert.equal(chalk.stripColor(written), "Hello, this is a message.\n");
      assert.notEqual(written, chalk.stripColor(written));
    });

    it("should apply all styles correctly", () => {
      let written = "";
      const out = setupOutput({color: true}, (str) => written += str);
      out.log({added: "Added."});
      out.log({removed: "Removed."});
      out.log({changed: "Changed."});
      out.log({highlighted: "Highlighted."});
      out.log({bad: "Bad."});
      out.log({heading: "Heading."});
      out.log({happy: "Happy."});
      out.log({sad: "Sad."});
      assert.equal(chalk.stripColor(written), "" +
        "Added.\nRemoved.\nChanged.\nHighlighted.\nBad.\n" +
        "====[ Heading. ]" + '='.repeat(62) + "\n" +
        "+[:-) Happy.\n+[:-( Sad.\n");
      assert.notEqual(chalk.stripColor(written), written);
    });

    it("should not break on long headings", () => {
      let written = "";
      const out = setupOutput({color: true}, (str) => written += str);
      out.log({heading: "This is an extremely long heading.".repeat(4)});
      assert.equal(written, "====[ " + "This is an extremely long heading.".repeat(4) + " ]====\n");
    });
  });
});
