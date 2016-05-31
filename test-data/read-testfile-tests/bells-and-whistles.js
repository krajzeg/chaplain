/* jshint node: true, esversion: 6 */
"use strict";

suite('bells', function() {
  config({cfg: true});

  test('a', {url: '/a'});
  test('b', () => {});
  test('c', {type: 'application/json'}, () => {});
});

