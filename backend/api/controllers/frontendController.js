const path = require('path');

exports.frontend_index = (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../..', 'build', 'index.html'));
}