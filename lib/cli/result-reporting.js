/* jshint node: true, esversion: 6 */
"use strict";

import _ from 'lodash';

// Status messages used for specific statuses.
const STATUS_MESSAGES = {
  'ok':
    (t) => `${t} passed`,
  'new':
    (t) => ({added: `${t} is newly added`}),
  'changed':
    (t) => ({changed: `${t} has changes`}),

  'error':
    (t) => ({bad: `${t} ran into some trouble`}),
  'exception':
    (t) => ({bad: `${t} threw an exception (whoops!)`})
};

// Reports a test result of any type to the user.
export default function reportTestResult(testName, result, output) {
  const statusMsg = STATUS_MESSAGES[result.status](testName);

  output.log({heading: statusMsg});

  switch(result.status) {
    case 'changed': reportChanges(result, output); break;
    case 'new': reportNew(result, output); break;

    default:
      if (result.message) {
        output.log(result.message);
      }
  }
}

function reportChanges(result, output) {
  const last = result.changes.length - 1;
  result.changes.forEach((change, index) => {
    const {message} = change;

    output.log(message);
    if (index != last) {
      output.log('');
    }
  });
}

function reportNew(result, output) {
  const relevantProps = _.omit(result.actual.props, ['mimeType']);
  const propsMsg = _.map(relevantProps, (value, key) => `${key}: ${value}`).join(", ");

  output.log("Your test returned ", {highlighted: propsMsg});
  output.log("and the following ", {highlighted: "contents"}, ":\n");
  output.log(result.actual.value);
}
