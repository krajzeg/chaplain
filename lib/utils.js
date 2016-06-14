/* jshint node: true, esversion: 6 */
"use strict";

import _ from 'lodash';
import Promise from 'bluebird';
import {UserFacingError} from "./errors";

export function withTimeout(promise, timeout, message) {
  return new Promise((resolve, reject) => {
    promise
      .then(output => resolve(output))
      .catch(err => reject(err));
    setTimeout(() => reject(new UserFacingError(message)), timeout);
  });
}

// Plugins trigger when one of the properties in their
// 'triggers' array is present on the object, or they
// can provide a predicate that decides this.
export function pluginTriggered(plugin, triggerObject) {
  if (plugin.triggers === true) {
    // some plugins have a 'triggers: true' setting which means
    // they always trigger
    return true;
  } else if (Array.isArray(plugin.triggers)) {
    // for arrays, check if any of the trigger props is present on triggerObject
    return _.intersection(plugin.triggers || [], _.keys(triggerObject)).length > 0;
  } else if (typeof plugin.triggers == 'function') {
    // for predicates, just run them
    return plugin.triggers(triggerObject);
  } else {
    throw new Error("The 'triggers' property on this plugin is incorrect: " + require('util').inspect(plugin));
  }
}
