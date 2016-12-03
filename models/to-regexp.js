/*
 * Very basic shared function between some models
 */
'use strict';

function toRegexp(caseInsensitive, str) {
  var s = '^' + str + '$';
  if (caseInsensitive) {
    return new RegExp(s, 'i');
  }
  return new RegExp(s);
}
module.exports = toRegexp;

var i = toRegexp.bind({}, true);
module.exports.i = i;

function alli(strs) {
  return strs.map(i);
}
module.exports.alli = alli;
module.exports.allCaseInsensitive = alli;
