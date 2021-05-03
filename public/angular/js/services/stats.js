angular.module('Aggie')

.factory('StatsCache', function($cacheFactory) {
    return $cacheFactory('stats');
});
