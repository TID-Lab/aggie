(function() {

  var User = function(attributes) {
    for (var i in attributes) {
      this[i] = attributes[i];
    }
  };

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

  // Export the User class for **Node.js**, with backwards-compatibility for
  // the old `require()` API. If we're in the browser, add `User` as a global
  // object via a string identifier, for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = User;
    }
    exports.User = User;
  } else {
    this.User = User;
  }

}).call(this);
