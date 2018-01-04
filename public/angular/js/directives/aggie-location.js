// This directive adds the latitude and longitude fields to a form and its model
// The fields will only show when minimalLatLng is false
// Errors will show when requested by another action

angular.module('Aggie')

.directive('aggieLocation', function() {
  return {
    restrict: 'E',
    templateUrl: '/templates/aggie_location.html',
    scope: {
      model: '=',
      minimalLatLng: '=',
      form: '=',
      showErrors: '='
    }
  };
});
