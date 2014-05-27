var data = {
  data: [{
    post_id: '52193296770_10151991845696771',
    updated_time: 1397151262,
    created_time: 1397151262,
    message: 'It\'s Prezi\'s 5th birthday! A huge thanks to our amazing users, we couldn\'t have gotten here without all 40 million of you. http://tcrn.ch/QaEYh8 We want to celebrate YOU—share your Prezi success story in the comments or on Twitter with the hashtag #Prezi5uccess.',
    comments: [{
      can_remove: false,
      can_post: false,
      count: 2,
      comment_list: [{
        fromid: 100004436493211,
        time: 1391020582,
        text: 'Comment 1',
        text_tags: [],
        id: '52193296770_10151868923261771_10846388',
        likes: 1,
        user_likes: false,
        post_fbid: '10151868942601771'
      }, {
        fromid: 100004436493211,
        time: 1391020582,
        text: 'Comment 2',
        text_tags: [],
        id: '52193296770_10151868923261771_10846388',
        likes: 1,
        user_likes: false,
        post_fbid: '10151868942601771'
      }]
    }]
  }]
};

var FacebookContentService = require('./facebook-content-service');
var util = require('util');

var FacebookDummyContentService = function(options) {
  this.fbPage = 'prezicom';
  this.filter = 'No filter';
  this.source = 'facebook-dummy';
  this.type = 'pull';
  FacebookContentService.call(this, options);
};

util.inherits(FacebookDummyContentService, FacebookContentService);

FacebookDummyContentService.prototype.start = function() {
  for (var i in data.data) {
    // Emit new data every 500ms
    setTimeout(this.fetch.bind(this), 500, data.data[i]);
  }
};

FacebookDummyContentService.prototype.fetch = function(post) {
  this.emit('report', this._parse(post, 'post'));
  this.emit('report', this._parse(post.comments[0].comment_list[0], 'comment'));
};

module.exports = FacebookDummyContentService;
