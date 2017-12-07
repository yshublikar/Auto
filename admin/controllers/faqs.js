var faqModel = require('../../models/faq.js');
var _ = require('underscore');
var fs = require("fs");

var faqs = {

    create: function(req, res) {
        console.log("req.body--------");
        console.log(req.body);
        if (req.body._id) {
            faqModel.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true }, function(err, data) {
                if (!err && data) {
                    res.status(200).json({ message: "FAQ updated successfully", doc: data, status: "success" });
                } else {
                    res.status(500).json({ message: "Something went wrong", doc: "", status: "error" });
                }
            })
        } else {
            faqModel.create(req.body, function(err, data) {
                if (!err && data) {
                    res.status(200).json({ message: "FAQ added successfully", doc: data, status: "success" });
                } else {
                    res.status(500).json({ message: "Something went wrong", doc: "", status: "error",err:err});
                }
            });
        }
    },

    getAll: function(req, res) {
        faqModel.find().populate('section').populate('category').exec(function(err, data) {
            if (!err && data) {
                res.status(200).json({ status: 'success', message: 'FAQs fetch successfully', docs: data });
            } else {
                res.status(500).json({ status: 'error', message: 'error in feching FAQs', doc: '' });
            }
        });
    },

    getOne: function(req, res) {
        faqModel.findById(req.params.id, function(err, data) {
            if (!err && data) {
                res.status(200).json({ status: 'success', message: 'FAQ fetch successfully', doc: data });
            } else {
                res.status(500).json({ status: 'error', message: 'error in feching FAQs', doc: '' });
            }
        });
    },

    remove: function(req, res) {
        faqModel.remove({ _id: req.params.id },
            function(err, doc) {
                if (err) {
                    res.status(500).json({ status: "error", message: "Error while deleting FAQ", error: err });
                } else {
                    res.status(200).json({ status: "success", message: "FAQ deleted successfully", doc: "" });
                }
            });
    }
}

module.exports = faqs;