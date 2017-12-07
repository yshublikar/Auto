
var config = require('../config/config.js');

var sendgrid = require('sendgrid')(config.sendgrid.username, config.sendgrid.password);
// var SMS = require('twilio')(config.twilio.accountSid, config.twilio.authToken);

var notification = {};
notification.sendEmail = function(headers, templateVars, myCallback) {

    processEmail(headers, templateVars, myCallback);
};


function processEmail(headers, templateVars, myCallback) {
    var emailPayload = new sendgrid.Email();
    var validationErr = [];

    if (headers.to) {
        emailPayload.to = headers.to;
        emailPayload.toname = headers.toName;
        //}
    }
    if (headers.subject) {
        emailPayload.subject = headers.subject;
    }

    if (headers.cc) {

        emailPayload.setCcs(headers.cc.split(","));
    }
    if (headers.bcc) {

        emailPayload.setBccs(headers.bcc.split(","));
    }
    if (headers.replyTo || headers.from) {
        emailPayload.replyto = headers.replyTo || headers.from;
    }
    if (headers.content) {
        emailPayload.text = headers.content;
    }
    if (templateVars.emailMessage) {
        emailPayload.html = templateVars.emailMessage;
    }
    

    if (headers.from) {
        //if (validateEmail(templateVars.from)) { validationErr.push({ fromErrMessage: "'from' email not valid" }); } else {
        emailPayload.from = headers.from;
        // emailPayload.fromname = headers.fromName;
        email(emailPayload, myCallback)

        //}
    } else {
        myCallback({ status: 400, message: 'validationErr', notificationMethod: 'template.templateType.method' });
    }

}

function email(emailPayload, myCallback) {
    sendgrid.send(emailPayload, function(err, json) {
        if (err) {
            myCallback({ status: 500, message: err.message });
        } else {
            myCallback({ status: 200, message: 'json.message', notificationMethod: 'template.templateType.method' });

        }
    });
}

module.exports = notification;
