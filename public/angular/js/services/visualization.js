angular.module('Aggie')

.factory('Visualization', function($resource) {
  return $resource("/api/v1/viz/?before=2020-09-18%2500:00:00&after=2020-09-15T00:00", null, {
		get: { method: "GET" },
	});
});
