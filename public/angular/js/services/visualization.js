angular.module('Aggie')

.factory('Visualization', function($resource) {
  return $resource("/api/v1/viz/?before=2020-10-10%2500:00:00&after=2020-10-01T00:00", null, {
		get: { method: "GET" },
	});
});
