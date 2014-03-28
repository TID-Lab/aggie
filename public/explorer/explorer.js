var TwitterSourceCreationHandler = Toolbox.Base.extend({
  constructor: function() {
    var self = this;

    this.form = $('#create_twitter form')

    // submit event handler
    this.form.on('submit', function(e){
      self.submit();
      e.preventDefault();
    });
  },

  submit: function() {
    $.ajax({
      url: '/api/source',
      type: 'post',
      data: JSON.stringify({
        type: 'twitter',
        keywords: this.form.find('#keywords').val(),
        enabled: true
      })
    }).done(function(data){
      $('#response').html(JSON.stringify(data));
    }).fail(function(jqxhr, status, error){
      $('#response').html(status + ' ' + error);
    });
  }
});

$(document).ready(function(){
  new TwitterSourceCreationHandler();
});