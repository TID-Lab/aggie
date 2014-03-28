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
    var self = this;
    $.ajax({
      url: '/api/source',
      type: 'post',
      data: JSON.stringify({
        type: 'twitter',
        keywords: this.form.find('#keywords').val(),
        enabled: true
      })
    }).done(function(data, status, jqxhr){
      $('#response').html(JSON.stringify(data, undefined, 2));
      self.updateRequestStatus(jqxhr, 'success');
    }).fail(function(jqxhr, status, error){
      $('#response').html(jqxhr.responseText);
      self.updateRequestStatus(jqxhr, 'error');
    });
  },

  updateRequestStatus: function(jqxhr, success_or_error) {
    $('#status').html(jqxhr.status + ' ' + jqxhr.statusText).removeClass().addClass(success_or_error);
  }
});

$(document).ready(function(){
  new TwitterSourceCreationHandler();
});