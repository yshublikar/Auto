var config = require('../config/config.js');
var userModel = require('../models/user');
var ObjectId = require('mongodb').ObjectID;
var http = require('https');
var fs = require('fs');

var user = {
    createUser: function(req, res) {
        console.log("userInformation", req.body)
        userModel.findOne({ facebookId: req.body.facebookId }, function(err, data) {

            if (err) {
                res.status(500).json({ status: "error", docs: err })
            } else if (data && data.status != 'Banned') {
                req.session.userModel = JSON.parse(JSON.stringify(data));
                //console.log("user details:",req.session.userModel);
                // req.session.save()
                //var userData = { "createdAt": new Date()};

                userModel.findOneAndUpdate({ _id: req.session.userModel._id }, { $set: { "lastLoggedIn": new Date() } }, { new: true }, function(err, commentDoc) {
                    if (err) {
                        res.status(500).json({ status: "error", docs: err })
                    } else {
                        res.status(200).json({ status: "success", message: "User created successfully", docs: data })
                    }
                })

            } else if (data && data.status == 'Banned') {
                res.status(500).json({ status: "error", message: "Sorry! Login Failed, your account has been blocked by Site Administrator.", docs: '' })
            } else {

                var file = fs.createWriteStream("./uploads/facebookProfile/" + req.body.facebookId + ".jpg");
                var request = http.get(req.body.profileImage, function(response) {
                    response.pipe(file);

                    // if (response) {
                    if (req.body.profileImage) {
                        req.body.profileImage = "facebookProfile/" + req.body.facebookId + '.jpg';
                    } else {
                        req.body.profileImage = getAvatarImagePath(req.body.name);

                    }
                    req.body.displayName = "Anonymous User";
                    req.body.avatarImage = getAvatarImagePath(req.body.displayName);
                    userModel.create(req.body, function(err, userData) {
                        if (err) {
                            res.status(500).json({ status: "error", docs: err })
                        } else {
                            req.session.userModel = JSON.parse(JSON.stringify(userData));
                            req.session.userModel['newUser'] = true;
                            console.log("---------****** User session: ", req.session.userModel);
                            // req.session.save()

                            res.status(200).json({ status: "success", message: "User created successfully", docs: userData })
                        }
                    })
                    // }
                });

            }
        })

    },
    logout: function(req, res) {
        req.session.userModel = null;
        res.status(200).json({ status: "success", message: "user logged out successfully" })
        /*req.session.destroy(function(err) {
            if (err) {
                console.log("error while logout", err)
            }
            res.status(200).json({ status: "success", message: "user logged out successfully" })

        })*/
    },
    getUser: function(userId, callback) {
        userModel.findOne({ _id: ObjectId(userId) }, function(err, user) {
            if (err) {
                callback(err, null)
            } else if (user) {
                callback(null, user)

            } else {
                callback(null, null)
            }
        })
    }
}

function getAvatarImagePath(name) {
    return "img/anonymous_user/" + name.trim().charAt(0).toLowerCase() + ".png";
}
module.exports = user;