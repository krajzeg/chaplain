suite('bells', function() {
  config({cfg: true});

  test('a', {url: '/a'});
  test('b', () => {});
  test('c', {type: 'application/json'}, () => {});
});

