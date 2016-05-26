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
export default function reportTestResult(result, output) {
  const {test, status} = result;
  const fullName = [test.suite.name, test.name].join(':');
  const statusMsg = STATUS_MESSAGES[status](fullName);
  output.log({heading: statusMsg});

  if (test.source && test.source.description) {
    const sourceDescription = test.source.description();
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
  output.log("Your test returned ", {highlighted: propertyMessage(result.actual.keyProps)});
  output.log("and the following ", {highlighted: "contents"}, ":\n");
  output.log(formattedOutput(result));
}

function reportKeyPropChange(result, output) {
  const propNames = ['type', 'status code'];
  const culprits = _.filter(propNames, p => result.actual.keyProps[p] != result.blessed.keyProps[p]);

  const oldProps = _.pick(result.blessed.keyProps, culprits);
  const newProps = _.pick(result.actual.keyProps, culprits);

  output.log("Your test used to return ", {removed: propertyMessage(oldProps, true)}, ".");
  output.log("But now, it returns ", {added: propertyMessage(newProps, true)}, ".");
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

function propertyMessage(props, change = false) {
  if (_.size(props)) {
    return _.map(props, (value, key) => `${key}: ${value}`).join(", ");
  } else {
    return "no properties" + (change ? " of that kind" : "");
  }
}
