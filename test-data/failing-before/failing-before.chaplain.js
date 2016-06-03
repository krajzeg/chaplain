suite('ba', function() {
  before(function() {
    throw new Error("This should be the reported exception.");
  });

  after(function() {
    throw new Error("This should not be reported.");
  });
});
