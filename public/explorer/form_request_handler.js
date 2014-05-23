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

      // Send query to get data back
      if (socket) {
        if (form.attr('id') === 'reportQuery') {
          socket.emit('query', form.serializeHash());
        } else if (form.attr('id') === 'incidentQuery') {
          socket.emit('incidentQuery', form.serializeHash());
        }
      }
      e.preventDefault();
    });
  }
});
