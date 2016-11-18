'use strict';

angular.module('Aggie')
.factory('Tags', function() {
  return {
    tagsToString: function(tags) {
      return tags.join(', ');
    },
    stringToTags: function(tags) {
      if (typeof tags === 'string') {
        return tags.split(',').map(function(tag) {
          return tag.trim();
        });
      }
      return tags;
    }
  };
});
