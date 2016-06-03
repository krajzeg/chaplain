suite('ba', function() {
  after(function() {
    throw new Error("This should be the reported exception.");
  });
});
