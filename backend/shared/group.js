// Group functionality shared across client and server.

(function() {

  var Group = function(attributes) {
    for (var i in attributes) {
      this[i] = attributes[i];
    }
  };

  Group.filterAttributes = [
    'title', 'locationName', 'assignedTo', 'status', 'veracity',
    'escalated', 'tags', 'public', 'storedAt', 'idnum', 'creator'
  ];
  Group.statusOptions = ['new', 'working', 'alert', 'closed'];

  // Export the Group class for node.js
  // If we're in the browser, add `Group` as a global object
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = Group;
    }
  } else {
    this.Group = Group;
  }

}).call(this);
