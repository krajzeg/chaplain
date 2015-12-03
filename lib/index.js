var Promise = require('bluebird');
var _ = require('lodash');

module.exports = createDeaconInstance;

function createDeaconInstance(options) {
  return {
    runTest() {
      return new Promise("We'll get there.");
    }
  };
}
