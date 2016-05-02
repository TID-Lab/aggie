'use strict';

var mailer = require('../../lib/mailer');
var config = require('../../config/secrets.js').get().email;
if (!process.argv[2]) {
  console.log('Usage: node test/manual/email.outgoing.test.js <destination-email-address>');
  process.exit();
}

// send mail with mailer
console.log('Sending message');
mailer.send('Test subject', 'Test body', process.argv[2], config.from, function(err, response) {
  if (err) {
    console.log('We got an error: ');
    console.log(err);
  } else {
    console.log('Message sent: ' + response.message);
  }
});

