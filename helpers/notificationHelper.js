var async = require("async");

//**************************************//


var _ = require('underscore');
var config = require('../config/config.js');
var sendgrid = require('sendgrid')(config.sendgrid.username, config.sendgrid.password);
//var SMS = require('twilio')(config.twilio.accountSid, config.twilio.authToken);

var notification = {};
notification.sendEmail = function(headers, myCallback) {

    console.log("we are in sendMail");
    var emailPayload={};
    headers.to = config.isDev ? config.headers.to : headers.to;
    headers.from = config.isDev ? config.headers.from : headers.from;
    headers.toName = config.isDev ? config.headers.toname : headers.toName
    headers.cc = config.isDev ? config.headers.cc : headers.cc;
    headers.bcc = config.isDev ? config.headers.bcc : headers.bcc;


    emailPayload.to = headers.to;
    emailPayload.from = headers.from;
    emailPayload.toname = headers.toName;
    emailPayload.subject = headers.subject;
    emailPayload.replyto = headers.replyTo || headers.from;
    emailPayload.text = headers.content;
    sendgrid.send(emailPayload, function(err, json) {
        if (err) {
            myCallback(err,null);
        } else {
            myCallback(null,json);
        }
    })
};


/*
var hError = null;

function processEmail(headers, templateVars, template, myCallback) {

    var subjectPrefix = (config.isDev && config.isSandbox) ? "Sandbox --- " : config.isDev ? "DEV --- " : "";

    var variables = template.templateType.dynamicVariables.split(',');
    if (template.templateType.method == 'email' || template.templateType.method == 'both') {
        template.emailMessage = traversObject(templateVars, variables, template.emailMessage, 0);
        template.emailSubject = traversObject(templateVars, variables, subjectPrefix + template.emailSubject, 0);

        if (!template.emailSubject) {
            myCallback({ status: 400, message: "Email Subject Haldlebars Error: " + hError });
            return;
        }
        if (!template.emailMessage) {
            myCallback({ status: 400, message: "Email Bocy Haldlebars Error: " + hError });
            return;
        }

        var emailPayload = new sendgrid.Email();
        var validationErr = [];

        if (headers.to) {
            //if (validateEmail(templateVars.to)) { validationErr.push({ fromErrMessage: "'to' email not valid" }); } else {

            // If Dev Send to Developer
            headers.to = config.isDev ? config.headers.to : headers.to;
            headers.toName = config.isDev ? config.headers.toname : headers.toName

            emailPayload.to = headers.to;
            emailPayload.toname = headers.toName;
            //}
        } else {;
            validationErr.push({ toErrMessage: "'to' email not supplied" });

        }
        if (template.emailSubject) {
            emailPayload.subject = template.emailSubject;
        } else if (headers.subject) {
            emailPayload.subject = headers.subject;

        } else {
            validationErr.push({ emailSubjectErrMessage: "email subject not supplied" });
        }

        if (headers.cc) {

            headers.cc = config.isDev ? config.headers.cc : headers.cc;

            emailPayload.setCcs(headers.cc.split(","));
        }
        if (headers.bcc) {

            headers.bcc = config.isDev ? config.headers.bcc : headers.bcc;

            emailPayload.setBccs(headers.bcc.split(","));
        }
        if (headers.replyTo || headers.from) {
            emailPayload.replyto = headers.replyTo || headers.from;
        }

        if (template.emailMessage) {
            emailPayload.html = template.emailMessage;
        } else if (headers.content) {
            emailPayload.text = headers.content;
        } else {
            validationErr.push({ contentErrMessage: "'email contents'not supplied" });
        }

        if (headers.from) {
            //if (validateEmail(templateVars.from)) { validationErr.push({ fromErrMessage: "'from' email not valid" }); } else {
            emailPayload.from = headers.from;
            emailPayload.fromname = headers.fromName;
            email(emailPayload, headers, templateVars, template, myCallback)

            //}
        } else if (template.emailConfig === 'agency') {
            if (template.agency) {
                emailPayload.from = template.agency.genEmail;
                emailPayload.fromname = template.agency.name;
                email(emailPayload, headers, templateVars, template, myCallback)
            } else {

                agencyModel.findById(templateVars.agency, function(err, doc) {
                    if (err) {
                        myCallback({ status: 500, message: err.message });
                    } else {
                        emailPayload.from = doc.genEmail;
                        emailPayload.fromname = doc.name;
                        email(emailPayload, headers, templateVars, template, myCallback)
                    }
                });
            }


        } else if (template.emailConfig === 'user') {
            emailPayload.from = templateVars.email;
            emailPayload.fromname = templateVars.firstName + '' + templateVars.lastName;
            email(emailPayload, headers, templateVars, template, myCallback);

        } else if (template.emailConfig === 'raterspot') {

            emailConfig.findOne({ "key": 'raterspot' }, function(err, doc) {
                if (err) {
                    myCallback({ status: 500, message: err.message });
                } else {
                    var tempObj = JSON.parse(doc.value);
                    emailPayload.from = tempObj.fromEmail;
                    emailPayload.fromname = tempObj.fromName;
                    email(emailPayload, headers, templateVars, template, myCallback)
                }
            });

        } else {

            validationErr.push({ fromErrMessage: "'from' email not supplied" });
            // }
            // if (validationErr.length == 0) {

            // } else {
            myCallback({ status: 400, message: validationErr, notificationMethod: template.templateType.method });

        }

    } else {
        myCallback({ status: 404, message: "Provided template is not for sending email.", notificationMethod: template.templateType.method });

    }
}

function email(emailPayload, headers, templateVars, template, myCallback) {
    sendgrid.send(emailPayload, function(err, json) {
        if (err) {
            myCallback({ status: 500, message: err.message });
        } else {

            var newNotification = new notificationLog();
            newNotification.event = template.templateType.event;
            newNotification.emailSubject = template.emailSubject;
            newNotification.emailMessage = template.emailMessage;
            newNotification.toEmail = headers.to;
            newNotification.fromEmail = headers.from;
            newNotification.cc = headers.cc;
            newNotification.bcc = headers.bcc;
            newNotification.agency = templateVars.agency;
            newNotification.user = templateVars.user;
            newNotification.sentToAgency = templateVars.sentToAgency;
            newNotification.showLogsTo = template.showLogsTo;
            newNotification.save(function() {

                myCallback({ status: 200, message: json.message, notificationMethod: template.templateType.method });
            });

        }
    });
}

// Render Template with Haldlebars
function traversObject(object, variables, message) {
    try {
        var template = handlebars.compile(message);
        var result = template(object);

        return result;
    } catch (e) {
        console.log(e);
        hError = e && e.message;
    }
}*/


module.exports = notification;
