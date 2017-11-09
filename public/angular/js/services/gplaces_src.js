angular.module('Aggie')

  .service('GPlacesSrc', ['Settings', function(Settings) {
    var src;
    var updateSrc = function() {
      Settings.get('gplaces', function success(setting) {
        src = 'https://maps.googleapis.com/maps/api/js?libraries=places&key=' + setting.gplaces.key;
      });
    };

    var getSrc = function() {
      return src;
    };

    return { getSrc: getSrc, updateSrc: updateSrc };
  }]);
