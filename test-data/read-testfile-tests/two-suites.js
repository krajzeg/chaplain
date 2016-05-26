suite('a', function() {
  config({a: true});
  test('a', {url: '/a'});
});
suite('b', function() {
  config({b: true});
  test('b', {url: '/b'});
});
