/* jshint node: true, esversion: 6 */
"use strict";

export const BASIC_USAGE = [
  "Usage:\n",
  "  chaplain                        - run all tests\n",
  "  chaplain run <test> <test>...   - only run the tests given\n",
  "  chaplain bless <test> <test>... - bless the results of these tests as correct\n"
];

export const HELP = [
  "Use 'chaplain --help' for more information on the available options."
];

export const DETAILED_HELP = [
  "Test patterns: <test> can be a literal test name or a regexp to match\n\n",
  "Options:\n",
  "  -d, --storage-dir <dir> - where to store chaplain files, defaults to .chaplain\n",
  "  -f, --file <testfile> - where to get your tests from, default chaplain.tests.js\n",
  "  -i, --interactive\n",
  "  -I, --non-interactive - interactive mode allows you to bless changes directly\n",
  "                          from the test run. Non-interactive is better for use\n",
  "                          in scripts and CI environments. Default mode depends\n",
  "                          on whether Chaplain is run from an interactive TTY.\n",
  "  -h, --help - display this help text"
];

export function outputUsage(output) {
  output.log(BASIC_USAGE);
  output.log(HELP);
}
export function outputHelp(output) {
  output.log(BASIC_USAGE);
  output.log(DETAILED_HELP);
}

