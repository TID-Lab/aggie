var DatePicker = angular.module('datePicker', ['ui.bootstrap']);

var DatePickerCtrl = function ($scope) {
  $scope.today = function() {
    $scope.dt_from = new Date();
    $scope.dt_to = new Date();
  };
  $scope.today();

  $scope.showWeeks = true;
  $scope.toggleWeeks = function () {
    $scope.showWeeks = ! $scope.showWeeks;
  };

  $scope.clear = function () {
    $scope.dt_from = null;
    $scope.dt_to = null;
  };

  // Disable weekend selection
   $scope.disabled = function(date, mode) {
    return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
  };

  $scope.toggleMin = function() {
    $scope.minDate = ( $scope.minDate ) ? null : new Date();
  };
  $scope.toggleMin();

  $scope.open = function($event,opened) {
    $event.preventDefault();
    $event.stopPropagation();

    $scope[opened] = true;
  };

  $scope.dateOptions = {
    'year-format': "'yy'",
    'starting-day': 1
  };

  $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'shortDate'];
  $scope.format = $scope.formats[0];
};
