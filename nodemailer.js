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


const confirmTrade = (email, details) => {
  nodemailer.createTestAccount((err, account) => {
    const transporter = nodemailer.createTransport({
      pool: true,
      service: 'gmail',
      auth: {
        user: 'confirmations@axedmarkets.com',
        pass: 'Axed123!',
      },
    })

    readHTMLFile(`${__dirname}/emailTemplate.html`, function (err, html) {
      const template = handlebars.compile(html)

      const replacements = {
        introduction: 'We are delighted to confirm your recent trade agreed on Axed Markets.',
        details
      }
      const htmlToSend = template(replacements)

      const mailOptions = {
        from: '"Axed Markets" <confirmations@axedmarkets.com>',
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

const appAlerts = (label, info) => {
  nodemailer.createTestAccount((err, account) => {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'confirmations@axedmarkets.com',
        pass: 'Axed123!',
      },
    })

    const mailOptions = {
      from: 'AM Admin',
      to: 'confirmations@axedmarkets.com',
      subject: 'AM Alert',
      text: 'Hello world?',
      html: `<container>
          <spacer size="16"></spacer>
            <row class="header-section">
              <columns small="9" large="10">
                <div style="width:100%;padding:10px 0px 10px 10px;font-size:25px;background:#3a444d;color:white;">${label}</div>
                <div style="margin-bottom:25px; margin-top:15px; font-size:14px;padding-left:2px;">${info}</div>
              </columns>
            <spacer size="16"></spacer>
          </container>`,
    }

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error)
      }
      console.log('Message sent: %s', info.messageId)
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
    })
  })
}


module.exports = {
  appAlerts,
  confirmTrade
}
