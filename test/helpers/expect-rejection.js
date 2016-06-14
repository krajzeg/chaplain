/* jshint node: true, esversion: 6 */
"use strict";

export default function expectRejection(promise) {
  return new Promise((resolve, reject) => {
    promise
      .then(() => reject(new Error("Expected this promise to be rejected.")))
      .catch(err => resolve(err));
  });
}
