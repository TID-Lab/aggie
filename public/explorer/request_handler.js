var RequestHandler = Toolbox.Base.extend({
  constructor: function() {
  },

  submit: function(params) {
    var self = this;

    // params.data is passed as a plain hash
    params.data = JSON.stringify(params.data);

    // show loading message
    self.updateRequestStatus();
    self.updateResponse('[Loading...]');

    $.ajax(params).done(function(data, status, jqxhr){
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
