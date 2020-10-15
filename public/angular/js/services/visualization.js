angular.module('Aggie')

.factory('Visualization', function($resource) {
	var endDate = new Date();
	var startDate = new Date();
	startDate.setTime(startDate.getTime() - 2 * (24 * 60 * 60 * 1000));
	console.log("/api/v1/viz/?before=" + endDate.toISOString() + "&after=" + startDate.toISOString());
  return $resource("/api/v1/viz/?before=2020-09-18%2500:00:00&after=2020-09-15T00:00", null, {
		get: { method: "GET" },
	});
});
