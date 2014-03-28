var FormRequestHandler = RequestHandler.extend({
  constructor: function(id) {
    var self = this;

    FormRequestHandler.__super__.constructor.call(this, id);

    var form = $('#' + id + ' form');

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
