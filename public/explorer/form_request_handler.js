var FormRequestHandler = RequestHandler.extend({
  constructor: function(form) {
    var self = this;

    // submit event handler
    form.on('submit', function(e){
      self.submit({
        type: form.attr('method') || 'get',
        url: form.attr('action'),
        data: form.serializeHash()
      });
      e.preventDefault();
    });
  }
});
