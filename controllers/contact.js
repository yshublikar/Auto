var businessHelper = require('../helpers/businessHelper');
var notificationHelper = require('../helpers/emailHelper');
var config = require('../config/config.js');
var handlebars=require('handlebars');
var fs = require("fs");

var contact = {

    default: function(req, res) {

        data = {
            page: 'Contact',
            title: 'Contact Us | Brand Label',
            userDetails: req.session.userModel,
            city: req.session.userCity
        }
        res.render('contact.html', { data: data });
    },
    informAdmin: function(req, res) {

        console.log("form data: ", req.body);
        var headers = {};
        var templateVars = {};
        headers.to = config.headers.to;
        headers.from = config.headers.from;
        headers.subject = "New Enquiry from Brandlabel.net";

        var sendData = {
                     "subject": req.body.subject,
                     "name": req.body.name,
                     "email":req.body.email,
                     "message":req.body.message,
                     "url":BASE_URL,
                     "logo":BASE_URL+"/img/logo.png"
                 }
                              

       var source ="./views/templates/sendMessage.html";

       fs.readFile(source, 'utf8', function (err,data) {
          if (err) {
           res.render('page404.html',{data: {title: "404 Error", page: "404page"}});
           // res.status(500).json({ status: 'error', message: "Cannot read Contents", doc: "" });
          }else
          {       
           var template = handlebars.compile(data);
           var result = template(sendData);
           templateVars.emailMessage = result;
           notificationHelper.sendEmail(headers, templateVars, function(email) {
                req.flash('info', 'Thank you for contact us ,we will get back to you very soon.');
                res.redirect('/contact');
            });
           }  
        
        });
      

    }
}

module.exports = contact;