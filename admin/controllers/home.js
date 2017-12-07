var businessHelper = require('../../helpers/businessHelper');
var notificationHelper = require('../../helpers/emailHelper');
//plugins
var mongoose = require('mongoose');
var jwt = require('jwt-simple');
var adminConfig=require('../../config/adminConfig')
var config=require('../../config/config')
var key = require('../../config/secret')();
console.log("key",key);
var encryptor = require('simple-encryptor')(key);
var ObjectId = mongoose.Types.ObjectId;
var handlebars=require('handlebars');
var fs = require("fs");

var adminModel = require('../../models/admin');
var home = {

    demo: function(req, res) {
       
        res.status(200).json({ status: 'success', message:"successfull demonstration."});
    },

      getOne: function(req, res) {
        
        adminModel.find({'_id':req.params.id}, function(err, doc) {
            if (err) {
                res.status(500).json({ status: 'error', message: 'Database Error:' + err, docs: '' });
            } else {

                 console.log("docs:",doc);

                res.status(200).json({ status: 'success', message: 'success', docs: doc });
            }
        });
    },

    login: function(req, res) {

    	adminModel.findOne({ 'email': req.body.email }).exec(function(err, docs) {
            if (err) {
                console.log("----------db error");
                res.json(500, { error: true, message: "Database error" });
            } else if (!docs) {
                console.log("Invalid Email::::");
                res.json(400, { error: true, message: "Invalid Credentials" });
            } else {

            	//console.log("in success");
                if (req.body.password == encryptor.decrypt(docs.password)) {
                    console.log("inside login::::");
                    var currentToken = genToken();
                    docs.token = currentToken.token;
                    docs.save(function(err,doc){
                        console.log("----------- saved", currentToken)
                        if (!err && doc) {
                            console.log("---------- successfully")
                            res.status(200).json({ error: false, message: "User found successfully", user: docs, token: currentToken });
                        } else {
                            console.log("----------- Error", err)
                            console.log("Invalid Password::::");
                            res.status(500).json({ error: true, message: "Invalid Credentials" });
                        }
                    });
                } else {
                    console.log("Invalid Password::::");
                    res.status(400).json({ error: true, message: "Invalid Credentials" });
                }
            }
        });
    },

    create:function(req, res) {
   	     console.log("req.body",req.body);
   	     req.body.password = encryptor.encrypt(req.body.password);
         adminModel.create(req.body, function(err, docs) {
            if (err) {
                res.status(500).json({ status: 'error', message: 'Database Error:', docs: 'failed to post job' });
            } else  {
                console.log("in else");
                console.log("docs: ",docs);
                res.status(200).json({ status: 'success', message: 'success', docs: docs});


            }

        });
    },

     sendForgotLink: function(req, res) {

        console.log("in function");
      adminModel.findOne({ email: req.body.email }, function(err, doc) {
            if (doc) {
                        
                       var headers = {};
                        var templateVars = {};
                        headers.to = doc.email;
                        headers.from = config.headers.from;
                        headers.subject = "Forgot Password Confirmation Link";
                        templateVars.name = doc.firstName + " " + doc.lastName;
                        var id = encryptor.encrypt(doc._id);
                        id = id.replace('/', 'ID');
                       templateVars.url = adminConfig.SITE_URL + "set-password/" + doc._id; 
                      

                      /*templateVars.emailMessage = "Hi " + templateVars.name + "<br><br> To reset your password <br><br>" + "<a href='" + templateVars.url + "'>Click here</a>";

                     notificationHelper.sendEmail(headers, templateVars, function(email) {
                            res.status(200).json({ status: 'success', message: 'Password reset link sent successfully Please check your Email', users: '' });
                        });*/

               var sendData = {
                    
                     "name":templateVars.name,
                     "url":templateVars.url,
                     "logo":BASE_URL+"/img/logo.png"
                 }
                              

               var source ="./views/templates/sendForgotLink.html";

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
                      res.status(200).json({ status: 'success', message: 'Password reset link sent successfully Please check your Email', users: '' });
                       
                    });
                   }  
                
                });

            } else {
                console.log("in else");
                res.status(500).json({ status: 'error', message: 'Email address did not match any records in the database.', docs: '' });
            }
        });
    },
    setPassword: function(req, res) {
        if (req.body.password != undefined) {
            req.body.password = encryptor.encrypt(req.body.password);
        }

            var id = req.params.id;

            console.log("req.body.password:",req.body.password);
            console.log("id:",id);
        
            adminModel.findById(id, function(err, doc) {
                if (err) {
                    console.log(err);
                    res.status(500).json({ status: 'error', message: 'Database Error:' + err, docs: '' });
                } else if (doc) {
                    console.log("before save");
                    console.log("doc: ",doc);
                    if (req.body.password != undefined) {
                        doc.password = req.body.password;
                        doc.save(function(err) {
                            console.log("after save");
                            if (!err)
                                res.status(200).json({ status: 'success', message: "Password updated successfully" });
                            else
                                res.status(400).json({ status: 'error', message: "Could not change password!" });
                        });
                    } else {
                        res.status(200).json({ status: 'success', message: "Valid Password reset URL" });
                    }
                } else {
                    res.status(400).json({ status: 'error', message: "Member not found!" });
                }
            });

      
    },

      changePassword: function(req, res) {
        console.log("chage Password req body", req.body);
        //req.body.newPassword = encryptor.encrypt(req.body.newPassword);

        adminModel.findOne({ "_id": req.body.userId }, function(err, user) {
            if (!user) {
                console.log("password not match");
                res.status(500).json({ status: 'error', message: 'Database Error:', user: 'user  not found' + err });

            } else {

                if (encryptor.decrypt(user.password) == req.body.oldPassword) {
                    console.log("in function");
                    req.body.newPassword = encryptor.encrypt(req.body.newPassword);

                    user.password = req.body.newPassword;
                    user.save(function(err, user) {

                        if (err) {
                            console.log("error function");
                            res.status(500).json({ status: 'error', message: 'Database Error:' + err, user: '' });

                        } else {
                            console.log("ok in success function", user);


                            res.status(200).json({ status: 'success', message: 'Document Updated Successfully', user: user });
                        }



                    });



                } else {
                    console.log("not matching");
                    res.status(500).json({ status: 'error', message: 'Database Error:' + err, user: '' });
                }


            }
        });
    }




}

function genToken() {
    var token = jwt.encode({}, require('../../config/secret')());
    return {
        token: token
    };
}

module.exports = home;
