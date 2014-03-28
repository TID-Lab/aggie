var BasicRequestHandler = RequestHandler.extend({
  constructor: function(id) {
    var self = this;

    BasicRequestHandler.__super__.constructor.call(this, id);

    var link = $('#' + id + ' a');
    $('#' + id + ' a').on('click', function(e){
      self.submit({
        type: link.data('method') || 'get',
        url: link.attr('href'),
        data: {}
      });
      e.preventDefault();
    });
  }
});
