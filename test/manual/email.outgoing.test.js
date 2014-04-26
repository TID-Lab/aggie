var config = require('../../config/secrets').email;
var nodemailer = require("nodemailer");

if (!process.argv[2]) {
  console.log("Usage: node test/manual/email.outgoing.test.js <destination-email-address>");
  process.exit();
}

var transport = nodemailer.createTransport.apply(this, config.transport);

var mailOptions = {
  from: config.from,
  to: process.argv[2],
  subject: "Hello ✔",
  text: "Hello world ✔",
  html: "<b>Hello world ✔</b>"
}

// send mail with defined transport object
transport.sendMail(mailOptions, function(err, response){
  if (err) {
    console.log(err);
  } else {
    console.log("Message sent: " + response.message);
  }
  transport.close(); // shut down the connection pool, no more messages
});