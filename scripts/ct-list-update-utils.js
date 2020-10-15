var CTListUpdateService = require('../lib/api/CT-list-update-service.js');

module.exports = function update(emitter) {
  console.log("Updating CT lists...");
  var service = new CTListUpdateService();
  service._updateCTList()
    .then(function(data) {
      emitter.emit("ctListUpdated");
      console.log("Done.");
    })
    .catch(function(err) {
      console.log(err)
    })
}
