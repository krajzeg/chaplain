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
  'key props changed':
    (t) => ({added: `${t} has changed key properties`}),

  'error':
    (t) => ({bad: `${t} ran into some trouble`}),
  'exception':
    (t) => ({bad: `${t} threw an exception (whoops!)`})
};

// Reports a test result of any type to the user.
export default function reportTestResult(testName, result, output) {
  const statusMsg = STATUS_MESSAGES[result.status](testName);
  output.log({heading: statusMsg});

  if (result.test.source && result.test.source.description) {
    const sourceDescription = result.test.source.description();
    output.log({heading: sourceDescription});
  }

  switch(result.status) {
    case 'changed': reportChanges(result, output); break;
    case 'key props changed': reportKeyPropChange(result, output); break;
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
  const relevantProps = result.actual.keyProps;
  const propsMsg = _.map(relevantProps, (value, key) => `${key}: ${value}`).join(", ");

  output.log("Your test returned ", {highlighted: propsMsg});
  output.log("and the following ", {highlighted: "contents"}, ":\n");
  output.log(formattedOutput(result));
}

function reportKeyPropChange(result, output) {
  const propNames = ['type', 'status code'];
  const culprits = _.filter(propNames, p => result.actual.keyProps[p] != result.blessed.keyProps[p]);

  const oldPropsMsg = _.map(_.pick(result.blessed.keyProps, culprits),
    (value, key) => `${key}: ${value}`).join(", ");
  const newPropsMsg = _.map(_.pick(result.actual.keyProps, culprits),
    (value, key) => `${key}: ${value}`).join(", ");

  output.log("Your test used to return ", {removed: oldPropsMsg});
  output.log("But now, it returns ", {added: newPropsMsg});
  output.log("The new ", {highlighted: "contents"}, " are:\n");
  output.log(formattedOutput(result));
}

function formattedOutput(result) {
  const format = result && result.test && result.test.format;
  if (format && format.formatOutput) {
    return format.formatOutput(result.actual.value);
  } else {
    return result.actual.value;
  }
}
