angular.module('Aggie')

.factory('Socket', function($rootScope) {
  var socket = io.connect('/');

  return {
    on: function(eventName, callback) {
      socket.on(eventName, function() {
        var args = arguments;
        $rootScope.$apply(function() {
          callback.apply(socket, args);
        });
      });
    },

    emit: function(eventName, data, callback) {
      socket.emit(eventName, data, function() {
        var args = arguments;
        $rootScope.$apply(function() {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    },

    join: function(room) {
      socket.emit('join', room);
    },

    leave: function(room) {
      socket.emit('leave', room);
    },

    off: socket.removeListener.bind(socket),
    removeAllListeners: socket.removeAllListeners.bind(socket),

    recreateConnection: function() {
      socket = io.connect('/', { 'force new connection': true });
    }
  };
});
