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

var ContentService = require('../content-service');
var util = require('util');

var FacebookDummyContentService = function(options) {
    this.fbPage = 'prezicom';
    this.filter = 'No filter';
    this.source = 'facebook-dummy';
    this.type = 'push';
    ContentService.call(this, options);
};

util.inherits(FacebookDummyContentService, ContentService);

FacebookDummyContentService.prototype.start = function() {
    var self = this;
    for (var i in data.data) {
        // Emit new data every 500ms
        setTimeout(this.fetch, 500, this, data.data[i]);
    }
};

FacebookDummyContentService.prototype.fetch = function(self, data) {
    self.emit('report', data);
    self.emit('report', data.comments[0].comment_list[0]);

};


module.exports = FacebookDummyContentService;