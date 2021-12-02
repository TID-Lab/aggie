// Library for handling tags
'use strict';

// Tags are string comma separated in the front end
var toArray = function(tags) {
  if (typeof tags === 'string') {
    return tags.split(',').map(function(tag) {
      return tag.trim();
    });
  }
  return tags;
};

var toCSV = function(tags) {
  return tags.join(', ');
};

module.exports = {
  toArray: toArray,
  toCSV: toCSV
};
