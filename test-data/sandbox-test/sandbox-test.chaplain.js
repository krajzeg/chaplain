var _ = require('lodash');

suite('sandbox', function() {
  // check if we have access to everything we'd expect
  test('all-globals', function() {
    return {
      everythingIsHere: !!(__dirname && __filename &&
      clearImmediate && clearInterval && clearTimeout &&
      setImmediate && setInterval && setTimeout &&
      console && exports && global && module && process && require &&
      Buffer && String && Array && Object)
    };
  });
});
