// Change database
var api = require('../controllers/api');
api.mongoose.disconnect(function() {
    api.mongoose.connect('mongodb://localhost/aggie-test');
});