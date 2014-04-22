var RequestHandler = Toolbox.Base.extend({
  constructor: function() {
  },

  submit: function(params) {
    var self = this;

    // show loading message
    self.updateRequestStatus();
    self.updateResponse('[Loading...]');

    $.ajax(params).done(function(data, status, jqxhr){
      self.updateRequests(data);
      self.updateResponse(data == '' ? data : JSON.stringify(data, undefined, 2));
      self.updateRequestStatus(jqxhr, 'success');
    }).fail(function(jqxhr, status, error){
      self.updateResponse(jqxhr.responseText);
      self.updateRequestStatus(jqxhr, 'error');
    });
  },

  // Update list of requests
  updateRequests: function(data) {
    if (data instanceof Array) {
      var clearSources = true;
      // Create new request elements for each source
      data.forEach(function(source) {
        if (source._id && source.type) {
          // Clear all source-level request items
          if (clearSources) {
            $('.source').remove();
            clearSources = false;
          }
          // Get source with events
          var $sourceLink = $('<a href="/api/v1/source/' + source._id + '" data-method="get">Get events for ' + source.type + ': "' + source.keywords + '"</a>');
          $('ul#requests').append($('<li>').addClass('source').html($sourceLink));
          new BasicRequestHandler($sourceLink);
          // Clear unread error count
          $sourceLink = $('<a href="/api/v1/source/_events/' + source._id + '" data-method="put">Clear unread error count for ' +  source.type + ': "' + source.keywords + '"</a>');
          $('ul#requests').append($('<li>').addClass('source').html($sourceLink));
          new BasicRequestHandler($sourceLink);
        }
      });
    }
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
