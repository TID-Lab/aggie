angular.module('Aggie')

.factory('CTListFilter', function() {
  var crowdtangle_lists = require('../../../../config/crowdtangle_list');
  return Array.from(new Set(Object.values(crowdtangle_lists.crowdtangle_list_account_pairs)))
});

// Object.keys(Object.entries(crowdtangle_lists.crowdtangle_list_account_pairs).reduce(function (acc, cur) {
//   if (cur[1] in acc) acc[cur[1]].push(cur[0])
//   else acc[cur[1]] = [cur[0]]
//   return acc;
// }, {}))