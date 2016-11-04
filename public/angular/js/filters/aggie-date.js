angular.module('Aggie')

.filter('aggieDate', ['dateFilter', function(dateFilter) {
  return function(data, type) {

    var formats = {
      short_time: 'h:mma',
      time: 'h:mm:ssa',
      date: 'yyyy-MM-dd',
      datetime: 'yyyy-MM-dd h:mm:ssa',
      datepicker: 'yyyy-MM-dd h:mma',
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
