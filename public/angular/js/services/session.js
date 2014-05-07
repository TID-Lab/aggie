angular.module('Aggie')
  .service('Session', function() {
    this.create = function (id, username) {
      this.id = id;
      this.username = username;
    };

    this.destroy = function() {
      this.id = null;
      this.username = null;
    };

    return this;
  });
