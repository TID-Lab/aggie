var BasicRequestHandler = RequestHandler.extend({
  constructor: function(link) {
    var self = this;

    link.on('click', function(e){
      self.submit({
        type: link.data('method') || 'get',
        url: link.attr('href'),
        data: {}
      });
      e.preventDefault();
    });
  }
});
