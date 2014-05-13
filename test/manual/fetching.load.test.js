require('../init');
var Source = require('../../models/source');
var Report = require('../../models/report');
var EventEmitter = require('events').EventEmitter;
var fetching = new EventEmitter();
var reportQueue = require('../../lib/fetching/report-queue');
var Bot = require('../../lib/fetching/bot');
var _ = require('underscore');

describe('Fetching module', function() {
  before(function(done) {
    // Initialize Bot Master
    botMaster = require('../../lib/fetching/bot-master');
    botMaster.addListeners('source', Source.schema);
    botMaster.addListeners('fetching', fetching);
    // Initialize Report Writer
    reportWriter = require('../../lib/fetching/report-writer');
    done();
  });

  beforeEach(function() {
    // Start with a clean Bot Master
    botMaster.bots = [];
  });

  afterEach(function(done) {
    fetching.emit('stop');
    botMaster.removeAllListeners('bot:report');
    // Log drops to console
    console.log('bots', botMaster.bots.length);
    botMaster.bots.forEach(function(bot) {
      if (bot.queue.drops) console.log('drops', bot.source._id, bot.queue.drops);
    });
    // Remove sources
    Source.remove(function(err) {
      if (err) return done(err);
      done();
    });
  });

  it('1000 per second - 1 source - buffer size 1', function(done) {
    var sources = 1;
    var options = {
      max: 1000,
      interval: 1,
      bufferLength: 1
    }
    this.timeout(options.max * options.interval * 2);
    createSources(sources, options, function() {
      setTimeout(function() { fetching.emit('start'); }, sources * 100);
    });
    var remaining = options.max * sources;
    botMaster.on('bot:report', function(bot) {
      if (--remaining === 0) done();
    });
  });

  it('1000 per second - 2 sources - buffer size 1', function(done) {
    var sources = 2;
    var options = {
      max: 1000,
      interval: 1,
      bufferLength: 1
    }
    this.timeout(options.max * options.interval * sources);
    createSources(sources, options, function() {
      setTimeout(function() { fetching.emit('start'); }, sources * 100);
    });
    var remaining = options.max * sources;
    botMaster.on('bot:report', function(bot) {
      if (--remaining === 0) done();
    });
  });

  it('1000 per second - 4 sources - buffer size 1', function(done) {
    var sources = 4;
    var options = {
      max: 1000,
      interval: 1,
      bufferLength: 1
    }
    this.timeout(options.max * options.interval * sources);
    createSources(sources, options, function() {
      setTimeout(function() { fetching.emit('start'); }, sources * 100);
    });
    var remaining = options.max * sources;
    botMaster.on('bot:report', function(bot) {
      if (--remaining === 0) done();
    });
  });

  it('1000 per second - 8 sources - buffer size 1', function(done) {
    var sources = 8;
    var options = {
      max: 1000,
      interval: 1,
      bufferLength: 1
    }
    this.timeout(options.max * options.interval * sources);
    createSources(sources, options, function() {
      setTimeout(function() { fetching.emit('start'); }, sources * 100);
    });
    var remaining = options.max * sources;
    botMaster.on('bot:report', function(bot) {
      if (--remaining === 0) done();
    });
  });

  it('1000 per second - 16 sources - buffer size 1', function(done) {
    var sources = 16;
    var options = {
      max: 1000,
      interval: 1,
      bufferLength: 1
    }
    this.timeout(options.max * options.interval * sources);
    createSources(sources, options, function() {
      setTimeout(function() { fetching.emit('start'); }, sources * 100);
    });
    var remaining = options.max * sources;
    botMaster.on('bot:report', function(bot) {
      if (--remaining === 0) done();
    });
  });

  it('1000 per second - 32 sources - buffer size 1', function(done) {
    var sources = 32;
    var options = {
      max: 1000,
      interval: 1,
      bufferLength: 1
    }
    this.timeout(options.max * options.interval * sources);
    createSources(sources, options, function() {
      setTimeout(function() { fetching.emit('start'); }, sources * 100);
    });
    var remaining = options.max * sources;
    botMaster.on('bot:report', function(bot) {
      if (--remaining === 0) done();
    });
  });

});

function createSources(num, options, callback) {
  var remaining = num;
  _.times(num, function() {
    Source.create({type: 'dummy-fast', keywords: JSON.stringify(options)}, function() {
      if (--remaining === 0) callback();
    });
  });
};
