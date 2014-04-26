var FormRequestHandler = RequestHandler.extend({
  constructor: function(form) {
    var self = this;

    // submit event handler
    form.on('submit', function(e){
      var method = form.attr('method') || 'get';
      self.submit({
        type: method,
        url: form.attr('action'),
        data: method == 'get' ? form.serialize() : form.serializeHash()
      });

      // Start streaming search data
      if (form.attr('id') === 'query') {
        // Establish socket connection
        var socket = io.connect('http://localhost');
        // Listen to new reports
        socket.on('reports', function (reports) {
          // Add each new report to display
          reports.forEach(function(report) {
            $('#stream').prepend($('<pre>' + JSON.stringify(report, undefined, 2) + '</pre>'));
          });
        });
        // Send query to get reports back
        socket.emit('query', form.serializeHash());
      }
      e.preventDefault();
    });
  }
});
