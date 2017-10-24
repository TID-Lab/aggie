// Incident functionality shared across client and server.

(function() {

  var Incident = function(attributes) {
    for (var i in attributes) {
      this[i] = attributes[i];
    }
  };

  Incident.filterAttributes = [
    'title', 'locationName', 'assignedTo', 'status', 'veracity',
    'escalated', 'tags', 'public'
  ];
  Incident.statusOptions = ['new', 'working', 'alert', 'closed'];

  // Export the Incident class for node.js
  // If we're in the browser, add `Incident` as a global object
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = Incident;
    }
  } else {
    this.Incident = Incident;
  }

}).call(this);
