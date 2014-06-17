angular.module('Aggie')

.filter('aggieDate', ['dateFilter', function(dateFilter) {
  return function(data, type) {
    var formats = {
      date: 'HH:mm:ss',
      time: "dd MMM ''''yy",
      datetime: "HH:mm:ss on dd MMM ''''yy",
      datepicker: "MM/dd/yyyy HH:mm:ss",
      timestamp: 'yyyy-MM-ddTHH:mm:ssZ'
    };

    var date = new Date(data);

    return dateFilter(date, formats[type || 'datetime']);
  };
}]);
