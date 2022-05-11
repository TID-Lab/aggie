// Handles requests for manipulating backend settings
// See https://developer.mozilla.org/en-US/docs/Web/HTTP/Status for sending correct error responses
'use strict';

var config = require('../../config/secrets');
var CTListUpdateService = require('../CT-list-update-service');

  // Enable/disable global fetching
exports.setting_update_fetch = (req, res, app) => {
  var fetching = null;
  switch (req.params.status) {
    case 'on':
      fetching = true;
      break;
    case 'off':
      fetching = false;
      break;
    default:
      return res.sendStatus(404);
  }
  // save fetching status
  config.updateFetching(fetching, (err) => {
    if (err) return res.sendStatus(500);
    res.sendStatus(200);
    app.emit(fetching ? 'fetching:start' : 'fetching:stop');
  });
}

exports.setting_update_ctlist = async (req, res, app) => {
  (new CTListUpdateService())._updateCTList().then(function(data) {
    app.emit('ctListUpdated');
    res.status(200).send("Successfully Updated CT List");
  }).catch((err) => {
    res.send(500, err);
  })
}
// Get Google Places API Key. Remember to set it so that only certain domains can use it
exports.setting_gplaces = (req, res) => {
  let result = {};
  result.gplaces = config.get()['gplaces'];
  result.setting = 'gplaces';
  res.status(200).send(result);
}

// Get any setting
exports.setting_setting = (req, res) => {
  let result = {};
  result[req.params.setting] = config.get({ reload: true })[req.params.setting];
  result.setting = req.params.setting;
  res.status(200).send(result);
}

// Modify setting
exports.setting_update = (req, res, app) => {
  config.update(req.params.entry, req.body.settings, (err) => {
    if (err) return res.send(500);
    // Updating settings may require to reload or reset bots or other modules
    app.emit('settingsUpdated', { setting: req.params.entry });
    res.sendStatus(200);
  });
}

  // We use post to test the media settings with the service provider but not to save
  // backend.post('/api/settings/media/:media/test', User.can('change settings'), (req, res) => {
  //   test.testContentService(req.params.media, req.body.settings, function(err, data, response) {
  //     if (err) {
  //       return res.status(200).send({ success: false, message: err.message });
  //     }

  //     res.status(200).send({ success: true });
  //   });
  // });

  // Clear setting
exports.setting_delete = (req, res) => {
  config.clear(req.params.entry, (err) => {
    if (err) res.send(500);
    res.sendStatus(200);
  });
}


