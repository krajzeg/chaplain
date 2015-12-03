/* jshint node: true, esversion: 6 */
"use strict";

export function makeSource(text, props = {}) {
  return () => ({text, props});
}

export function makeEmptySource() {
  return () => undefined;
}

export function equalsComparator(previous, current) {
  return (previous == current) ? [] : [`${previous} != ${current}`];
}
