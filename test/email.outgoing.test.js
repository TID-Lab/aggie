var config = require('../config/secrets').email;
var nodemailer = require("nodemailer");

var transport = nodemailer.createTransport.apply(this, config);

var mailOptions = {
  from: "Tom Smyth ✔ <tom@sassafras.coop>",
  to: "tomsmyth@gmail.com",
  subject: "Hello ✔",
  text: "Hello world ✔",
  html: "<b>Hello world ✔</b>"
}

// send mail with defined transport object
transport.sendMail(mailOptions, function(err, response){
  if (err) {
    console.log(error);
  } else {
    console.log("Message sent: " + response.message);
  }
  transport.close(); // shut down the connection pool, no more messages
});