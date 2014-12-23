// User functionality shared across client and server.

(function() {

  var User = function(attributes) {
    for (var i in attributes) {
      this[i] = attributes[i];
    }
  };

  User.PASSWORD_MIN_LENGTH = 6;

  User.permissions = {
    'view data': ['viewer', 'monitor', 'manager', 'admin'],
    'edit incidents': ['monitor', 'manager', 'admin'],
    'edit reports': ['monitor', 'manager', 'admin'],
    'edit sources': ['manager', 'admin'],
    'toggle fetching': ['manager', 'admin'],
    'manage trends': ['manager', 'admin']
  };

  // Determine if a user can do a certain action
  User.prototype.can = function(permission) {
    if (User.permissions[permission]) {
      return User.permissions[permission].indexOf(this.role) > -1;
    }
    return false;
  };

  // Determine if a user is of a specified role
  User.prototype.is = function(role) {
    return this.role === role;
  }

  // Export the User class for node.js
  // If we're in the browser, add `User` as a global object
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = User;
    }
  } else {
    this.User = User;
  }

}).call(this);
