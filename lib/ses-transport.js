// custom Winston transport for AWS SES (Simple Email Service) using the AWS JavaScript SDK
// based a now-outdated outdated package https://github.com/jpgarcia/winston-amazon-ses

const Transport = require('winston-transport');
const nodemailer = require('nodemailer')
const aws = require('aws-sdk')
const util = require('util')

module.exports = class SESTransport extends Transport {
  constructor(opts) {
    super(opts);
    this.opts = opts

    if (this.opts.silent) {
      callback()
      return
    }

    aws.config.update({
      accessKeyId: opts.accessKeyId,
      secretAccessKey: opts.secretAccessKey,
      region: opts.region,
    })

    var transport = {
      SES: new aws.SES({
        apiVersion: '2010-12-01'
      })
    }
    this.transport = nodemailer.createTransport(transport)
  }

  log(info, callback) {
    var body = `<h3>Message</h3><p>${info.message}</p><br>`
    if (info.meta) body += `<h3>Metadata</h3><p>${util.inspect(info.meta)}</p>`

    this.transport.sendMail({
      from: this.opts.from,
      to: this.opts.to,
      subject: `winston: ${info.level} ${info.message}`,
      body: {
        html: body,
      }
    }, function (err) {
      if (err) {
        this.emit('error', err)
      } else {
        this.emit('logged', info)
      }
      callback()
    })
  }
};