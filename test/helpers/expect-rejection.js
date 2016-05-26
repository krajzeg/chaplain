/* jshint node: true, esversion: 6 */
"use strict";

export default function expectRejection(promise) {
  return promise
    .then(() => {throw new Error("Expect this promise to be rejected.");})
    .catch(err => err);
}
