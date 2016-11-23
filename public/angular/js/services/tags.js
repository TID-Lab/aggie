'use strict';

angular.module('Aggie').factory('Tags', ['shared', function(shared) {
  return {
    tagsToString: shared.Tags.toCSV,
    stringToTags: shared.Tags.toArray
  };
}]);
