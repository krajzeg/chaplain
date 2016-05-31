/* jshint node: true, esversion: 6 */
"use strict";

export default function setupPromptMock(answerList) {
  const promptFn = () => {
    return Promise.resolve().then(() => {
      const answer = answerList.shift();
      if (answer) {
        return answer;
      } else {
        throw new Error("Mock prompt() ran out of pre-programmed answers.");
      }
    });
  };

  // lets us check if the prompt was exhausted
  promptFn.exhausted = () => (answerList.length == 0);

  return promptFn;
}
