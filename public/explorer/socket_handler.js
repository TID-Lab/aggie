// Establish socket connection
var socket = io.connect('/');

// Add the result from each of the socket streams
socket.on('fetchingStatusUpdate', prependData('fetchingStatusUpdate'));
socket.on('reports', prependData('reports'));

// Add event and data to top of the stream list
function prependData(event) {
  return function(data) {
    $('#stream').prepend($('<pre>' + event + ':<br>' + JSON.stringify(data, undefined, 2) + '</pre>'));
  }
}
