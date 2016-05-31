/* jshint node: true, esversion: 6 */
"use strict";

export const BASIC_USAGE = [
  "Usage:\n",
  "  chaplain                                    - run all tests\n",
  "  chaplain run <suite:test> <suite:test>...   - only run the tests given\n",
  "  chaplain bless <suite:test> <suite:test>... - bless the results of these tests as correct\n"
];

export const HELP = [
  "Use 'chaplain --help' for more information on the available options."
];

export const DETAILED_HELP = [
  "Test patterns:\n",
  "  <suite:test> can be literal, e.g. 'my-suite:my-test', or a regexp, for example\n",
  "  something like 'my-suite:.*' will match all tests from that suite.\n\n",
  "Options:\n",
  "  -d, --storage-dir <dir> - where to store blessed output, defaults to .chaplain\n",
  "  -f, --file <testfile>   - where to get your testfile, default chaplain.tests.js\n",
  "  -i, --interactive\n",
  "  -I, --non-interactive   - interactive mode allows you to bless changes directly\n",
  "                            from the test run. Non-interactive is better for use\n",
  "                            in scripts and CI environments. Default mode depends\n",
  "                            on whether Chaplain is run from an interactive TTY.\n",
  "  -c, --color\n",
  "  -C, --no-color          - forces ANSI color output to be enabled/disabled.\n",
  "  -h, --help              - display this help text\n"
];

export function outputUsage(output) {
  output.log(BASIC_USAGE);
  output.log(HELP);
}
export function outputHelp(output) {
  output.log(BASIC_USAGE);
  output.log(DETAILED_HELP);
}
