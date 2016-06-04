/* jshint node: true, esversion: 6 */
"use strict";

import html from '../../lib/plugins/format-html';
import setupOutput from '../../lib/cli/output';
import {assert} from 'chai';

describe("HTML diff", () => {
  const out = setupOutput({color: false}, null, null);

  it("should not detect changes where there aren't any", () => {
    const h = html.create({}, {});
    const actual = "<html><body>Hi! There.</body>";
    const expected = "<html> <body>  Hi! There. </body>";
    assert.deepEqual(h.compare(actual, expected), []);
  });

  it("should report all types of changes correctly", () => {
    const h = html.create({}, {});
    const expected = "<html><body id='body'>" +
      "<div id='a' class='before'></div>" +
      "<div id='b' class='removed'>Removed!</div>" +
      "<div id='t'>Old text</div>" +
      "</body>";
    const actual = "<html><body id='body'>" +
      "<div id='a' class='after'></div>" +
      "<div id='c' class='added'>Added!</div>" +
      "<div id='t'>New text</div>" +
      "</body>";

    const result = h.compare(actual, expected);

    assert.lengthOf(result, 4);

    const msgs = result.map(r => out.prepareMessage(r.message));
    assert.ok(msgs[0].includes("Changes in html > body#body > div#a:\n"));
    assert.ok(msgs[0].includes('class="beforeafter"'));
    assert.ok(msgs[1].includes("Removed in html > body#body:\n"));
    assert.ok(msgs[1].includes('<div id="b"'));
    assert.ok(msgs[2].includes("Added in html > body#body:\n"));
    assert.ok(msgs[2].includes('<div id="c"'));
    assert.ok(msgs[3].includes('Text changed inside html > body#body > div#t:\n'));
    assert.ok(msgs[3].includes('OldNew text'));
  });

  it("should pass options to hiff correctly", () => {
    const h = html.create({}, {html: {ignore: ['div.ignore']}});
    const expected = "<html><div class='ignore'>Before</div></html>";
    const actual = "<html><div class='ignore'>After</div></html>";
    assert.deepEqual(h.compare(actual, expected), []);
  });

});
