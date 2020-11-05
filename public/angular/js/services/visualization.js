angular.module('Aggie')
  .factory('Visualization', function ($resource) {
    var endDate = new Date();
    var startDate = new Date();
    startDate.setTime(startDate.getTime() - 2 * (24 * 60 * 60 * 1000));
		// var endDate = new Date("2020-09-21T09:00:59.000Z");
		// var startDate = new Date("2020-09-21T09:00:59.000Z");
		// startDate.setTime(startDate.getTime() - 2 * (24 * 60 * 60 * 1000));
    // console.log("/api/v1/viz/?before=" + endDate.toISOString() + "&after=" + startDate.toISOString());
    return $resource(
      "/api/v1/viz/?before=" + endDate.toISOString() + "&after=" + startDate.toISOString(),
      null,
      {
        get: { method: "GET", isArray: false },
      }
    );
  });
