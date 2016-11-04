angular.module('Aggie')

.filter('tripleDigit', function() {
  return function(number) {
    if (number !== null && number !== undefined) {
      var str = '' + number;
      while (str.length < 3) str = '0' + str;
      return str;
    }
  };
});
