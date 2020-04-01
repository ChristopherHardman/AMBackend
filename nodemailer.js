const nodemailer = require('nodemailer')
const handlebars = require('handlebars')
const fs = require('fs')

const readHTMLFile = function (path, callback) {
  fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
    if (err) {
      throw err
      callback(err)
    } else {
      callback(null, html)
    }
  })
}


const confirmTrade = (email) => {
  nodemailer.createTestAccount((err, account) => {
    const transporter = nodemailer.createTransport({
      pool: true,
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    })

    readHTMLFile(`${__dirname}/emailTemplate.html`, function (err, html) {
      const template = handlebars.compile(html)

      const replacements = {
        introduction: 'Hi there',
      }
      const htmlToSend = template(replacements)

      const mailOptions = {
        from: '"Axed Markets" <info@am.com>',
        to: email,
        subject: 'Confirmation of trade',
        text: 'Confirmation of trade',
        html: htmlToSend,
      }

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error)
        }
        console.log('Message sent: %s', info.messageId)
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
      })
    })
  })
}


module.exports = {
  confirmTrade
}
