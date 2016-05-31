import {runCLIAndGetOutput} from '../test/helpers/test-cli';
import path from 'path';

// This is a Chaplain testfile used to test the CLI output of Chaplain itself.
// This gives a bit of dogfooding, and as a bonus, Chaplain works well for
// testing text output of CLI tools.
suite("chaplain", () => {
  config({
    text: {
      ignoreWords: ['[.+?!]+'], // test order is not reproducible between runs, so the "Running tests .?!!..."
                                // progress indicator has to be excluded

      ignoreLines: ["\\s+at .*\\d+:\\d+.*"] // exact stacktrace lines are not reproducible between node versions/runs
    }
  });

  // test a suite that produces every possible type of result
  test("every-result-type", () => runCLIAndGetOutput({
    files: path.join(process.cwd(), 'test-data/every-result-type'),
    args: ['-IC', '-f', 'every-result-type.chaplain.js', '-d', './']
  }));
});
