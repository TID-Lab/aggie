/*
 * Takes a list of objects representing translation dictionaries and creates a
 * new object which has all the (deep) keys of the input objects and whose
 * values are __ALL_CAPS_UNDERSCORE_DELIMITED, plus any {{interpolated}}
 * {{parameters}} found in the input strings.
 */
'use strict';

var _ = require('lodash');
var deepMerge = require('deepmerge');

function renameOne(data, key) {
  var params = _.union.apply({}, _.map(data, function(dict) {
    var translation = _.get(dict, key) || '';
    return translation.match(/{{.*?}}/g);
  }));
  params = params.length ? ' [' + params + ']' : '';
  return '__' + key.toUpperCase().replace(/ /g, '_') + params;
}

function renameValues(data, key, dict) {
  if (typeof dict !== 'object') return renameOne(data, key);

  return _.mapValues(dict, function bar(val, childKey) {
    var deepKey = key ? key + '.' + childKey : childKey;
    return renameValues(data, deepKey, val);
  });
}

module.exports = function makeDebugDict(allDicts) {
  var mergedDicts = _.reduce(_.values(allDicts), deepMerge);
  return renameValues(allDicts, null, mergedDicts);
};
