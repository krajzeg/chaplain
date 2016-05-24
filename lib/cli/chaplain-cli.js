#!/usr/bin/env node
/* jshint node: true, esversion: 6 */
"use strict";

// The entire CLI is instantiated by passing the "real world" into it.
// This enables testing of the entire CLI application using mocks of
// the filesystem, input and output.
import inquirer from 'inquirer';
import fs from 'fs';
import cliEngine from './cli-engine';

const engine = cliEngine({
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
  .then(() => process.exit(0))
  .catch(err => {
    console.error("ERROR IN ENGINE: ", err);
  });
