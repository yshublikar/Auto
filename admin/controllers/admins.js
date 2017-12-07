var config = require('../../config/config');
var secret = require('../../config/secret');

var adminModel = require('../../models/admin');
var encryptor = require('simple-encryptor')(secret());
var admins = {};
admins.addAdmin = function(req, res) {
    adminModel.findOne({ email: req.body.email },function(err, doc) {
            if (err) {
                res.status(500).json({ status: "error", message: "Error while creating admin user", error: err });
            } else if (doc) {
                res.status(400).json({ status: "error", message: "User allready exist.", docs: '' });

            } else {
                req.body.password = encryptor.encrypt(req.body.password);
                adminModel.create(req.body, function(err, doc) {
                    if (err) {
                        res.status(500).json({ status: "error", message: "Error while creating admin user", error: err });
                    } else {
                        res.status(200).json({ status: "success", message: "Admin user created successfully", doc: doc });
                    }

                })
            }
        })
};
admins.updateAdmin = function(req, res) {
    req.body.password = encryptor.encrypt(req.body.password);

    adminModel.findByIdAndUpdate(req.params.adminId, req.body, { new: true },
        function(err, doc) {
            if (err) {
                res.status(500).json({ status: "error", message: "Error while creating admin user", error: err });
            } else {
                res.status(200).json({ status: "success", message: "Admin user created successfully", doc: doc });
            }

        })
};
admins.deleteAdmin = function(req, res) {

    adminModel.remove({
            _id: req.params.adminId
        },
        function(err, doc) {
            if (err) {
                res.status(500).json({ status: "error", message: "Error while creating admin user", error: err });
            } else {
                res.status(200).json({ status: "success", message: "Admin user created successfully", doc: doc });
            }

        })
};
admins.getOneAdmin = function(req, res) {
    adminModel.findById(req.params.adminId,
        function(err, doc) {
            if (err) {
                res.status(500).json({ status: "error", message: "Error while creating admin user", error: err });
            } else {
                res.status(200).json({ status: "success", message: "Admin user created successfully", doc: doc });
            }

        })
};
admins.getAllAdmin = function(req, res) {
    adminModel.find(function(err, docs) {
        if (err) {
            res.status(500).json({ status: "error", message: "Error while creating admin user", error: err });
        } else {
            res.status(200).json({ status: "success", message: "Admin user created successfully", docs: docs });
        }

    })
};
admins.setPassword = function(req, res) {
    req.body.password = encryptor.encrypt(req.body.password);

    adminModel.findByIdAndUpdate(req.params.adminId, {
            $set: { password: req.body.password }
        }, { new: true },
        function(err, doc) {
            if (err) {
                res.status(500).json({ status: "error", message: "Error while creating admin user", error: err });
            } else {
                res.status(200).json({ status: "success", message: "Password Updated successfully", doc: doc });
            }

        })
};
module.exports = admins;