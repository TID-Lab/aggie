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

    self.updateRequestStatus();
    self.updateResponse('[Loading...]');

    $.ajax({
      url: '/api/source',
      type: 'post',
      data: JSON.stringify({
        type: 'twitter',
        keywords: this.form.find('#keywords').val(),
        enabled: true
      })
    }).done(function(data, status, jqxhr){
      self.updateResponse(data == '' ? data : JSON.stringify(data, undefined, 2));
      self.updateRequestStatus(jqxhr, 'success');
    }).fail(function(jqxhr, status, error){
      self.updateResponse(jqxhr.responseText);
      self.updateRequestStatus(jqxhr, 'error');
    });
  },

  updateResponse: function(str) {
    $('#response').html(str == '' ? '[Empty response]' : str);
  },

  updateRequestStatus: function(jqxhr, success_or_error) {
    if (jqxhr)
      $('#status').html(jqxhr.status + ' ' + jqxhr.statusText).removeClass().addClass(success_or_error);
    else
      $('#status').html('');
  }
});

$(document).ready(function(){
  new TwitterSourceCreationHandler();
});