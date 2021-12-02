var emitter = require('events').EventEmitter;
var e = new emitter();
var update = require('./ct-list-update-utils');

update(e);
