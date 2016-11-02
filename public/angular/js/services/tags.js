'use strict';

angular.module('Aggie')
.factory('Tags', function() {
  return {
    tagsToString: function(tags) {
      return tags.join(', ');
    }
  };
});
