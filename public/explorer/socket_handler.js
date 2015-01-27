// Establish socket connection
var socket = io.connect('/');

// Add the result from each of the socket streams
socket.on('reportStatusChanged', prependData('reportStatusChanged'));
socket.on('reportIncidentChanged', prependData('reportIncidentChanged'));
socket.on('sourceErrorCountUpdated', prependData('sourceErrorCountUpdated'));
socket.on('sources', prependData('sources'));
socket.on('reports', prependData('reports'));
socket.on('incidents', prependData('incidents'));
socket.on('trend', prependData('trend'));

// Add event and data to top of the stream list
function prependData(event) {
  return function(data) {
    $('#stream').prepend($('<pre>' + event + ':<br>' + JSON.stringify(data, undefined, 2) + '</pre>'));
  }
}
