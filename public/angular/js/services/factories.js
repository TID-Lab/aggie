angular.module('Aggie')

.factory('Report', function($resource) {
  var searchResults = [];

  return $resource('/api/v1/report/:id', null, {
    'query': { isArray: false },
    'save': { method: 'PUT' }
  });
})

.factory('Source', function($resource) {
  return $resource('/api/v1/source/:id', null, {
    'save': { method: 'PUT' },
    'resetUnreadErrorCount': { method: 'PUT', url: '/api/v1/source/_events/:id' },
    'create': { method: 'POST' },
    'update': { method: 'PUT' }
  });
})

.factory('Fetching', function($resource) {
  var Fetching = $resource("/api/v1/fetching/:op", {}, {
    'toggle': { method: 'PUT' },
  });

  return {
    get: function(success, failure) {
      return Fetching.get({}, function(data) {
        success(data.enabled);
      }, failure);
    },
    set: function(enabled) {
      return Fetching.toggle({ op: enabled ? 'on' : 'off' }, {})
    }
  }
})

.factory('Socket', function ($rootScope) {
  var socket = io.connect('/');
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function() {
        var args = arguments;
        $rootScope.$apply(function() {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});
