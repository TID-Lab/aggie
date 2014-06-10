angular.module('Aggie')

.filter('aggieDate', ['dateFilter', function(dateFilter) {
  return function(data, type) {
    var formats = {
      date: 'HH:mm:ss',
      time: "dd MMM ''''yy",
      datetime: "HH:mm:ss on dd MMM ''''yy",
      timestamp: 'yyyy-MM-ddTHH:mm:ssZ'
    };

    return dateFilter(data, formats[type || 'datetime']);
  };
}]);
