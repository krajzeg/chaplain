#!/usr/bin/env node

// This file is in ES5 - having executable files that are generated
// by babel each time is a major pain in the neck.

// The entire CLI is instantiated by passing the "real world" into it.
// This enables testing of the entire CLI application using mocks of
// the filesystem, input and output.
var inquirer = require('inquirer');
var fs = require('fs');
var cliEngine = require('../dist/lib/cli/cli-engine').default;

var engine = cliEngine({
  // system
  argv: process.argv,
  // FS
  fs: fs,
  // I/O
  isTTY: process.stdout.isTTY,
  write: process.stdout.write.bind(process.stdout),
  writeError: process.stderr.write.bind(process.stderr),
  prompt: inquirer.prompt.bind(inquirer)
});

// The entire job of the engine is to run whatever was needed,
// and return an exit code for the system.
engine.run()
  .then(function(exitCode) { return process.exit(exitCode); })
  .catch(function(err) {
    console.error("ERROR IN ENGINE: ", err);
    process.exit(2);
  });
