angular.module('Aggie')

.filter('aggieDate', ['dateFilter', function(dateFilter) {
  return function(data, type) {

    var formats = {
      time: 'HH:mm:ss',
      date: "dd MMM ''''yy",
      datetime: "HH:mm:ss on dd MMM ''''yy",
      datepicker: "MM/dd/yyyy HH:mm:ss",
      timestamp: 'yyyy-MM-ddTHH:mm:ssZ'
    };

    var date = new Date(data),

    type = typeof type !== 'undefined' ? type : 'datetime';

    if (type == 'datetime' && date.getHours() + date.getMinutes() + date.getSeconds() == 0) {
      type = 'date';
    }

    return dateFilter(date, formats[type]);
  };
}]);
