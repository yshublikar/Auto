var config = require('../../config/config');
var userModel = require('../../models/user');
var fs = require("fs");
var json2xls = require('json2xls');

var users = {
    getAll: function(req, res) {
        userModel.find({}, function(err, data) {
            if (!err && data) {
                res.status(200).json({ status: 'success', message: 'Users fetch successfully', docs: data });
            } else {
                res.status(500).json({ status: 'error', message: 'error in feching Users', doc: '' });
            }
        });
    },
    updateUserStatus: function(req, res) {
        console.log("req", req.body);
        userModel.findByIdAndUpdate(req.params.userId, { $set: { status: req.body.status } }, { new: true },
            function(err, user) {
                if (err) {
                    res.status(500).json({ status: "error", message: "Error while updated User status", error: err });
                } else {
                    res.status(200).json({ status: "success", message: "User status updated successfully", docs: user });
                }

            })
    },
    warneduser: function(req, res) {
        console.log("req", req.params);
        userModel.findByIdAndUpdate(req.params.userId, { $inc: { warnedCount: 1 } }, { new: true },
            function(err, user) {
                if (err) {
                    res.status(500).json({ status: "error", message: "Error while updated User status", error: err });
                } else {
                    res.status(200).json({ status: "success", message: "User status updated successfully", docs: user });
                }

            })
    },
    newsletterusers: function(req, res) {
        userModel.find({ isSubscribed: true }, function(err, data) {
            if (!err && data) {
                res.status(200).json({ status: 'success', message: 'Users fetch successfully', docs: data });
            } else {
                res.status(500).json({ status: 'error', message: 'error in feching Users', doc: '' });
            }
        });
    },
    getExcel: function(req, res) {
        userModel.find({ isSubscribed: true }, function(err, data) {
            if (!err && data) {
                if (data != '') {
                    var xls = json2xls(data, {
                        fields: { name: 'string', email: 'string', phone: 'string', displayName: 'string', facebookId: 'string', location: 'string' }
                    });
                    console.log("xls", xls)
                    fs.writeFileSync('uploads/newsletter/data.xlsx', xls, 'binary');

                    data = BASE_URL + 'newsletter/data.xlsx';
                }
                res.status(200).json({ status: 'success', message: 'Users fetch successfully', docs: data });

            } else {
                res.status(500).json({ status: 'error', message: 'error in feching Users', doc: '' });
            }
        });
    }
};

module.exports = users;