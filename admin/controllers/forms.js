var makeModel = require('../../models/make.js');
var questionModel = require('../../models/question.js');
var formModel = require('../../models/form.js');
var _ = require('underscore');
var fs = require("fs");

var forms = {

    create: function(req, res) {
        console.log("req",req.body);
        if (req.query.id) {
            formModel.findByIdAndUpdate(req.query.id, req.body, { new: true }, function(err, form) {
                if (err) {
                    res.status(500).json({ status: 'error', message: "Database error: " + err, docs: "" });
                } else {
                    res.status(200).json({ status: 'success', message: "Form added successfully.", doc: form });
                }
            })
        } else {
            formModel.create(req.body, function(err, form) {
                if (err) {
                    res.status(500).json({ status: 'error', message: "Database error: " + err, docs: "" });
                } else {
                    res.status(200).json({ status: 'success', message: "Form added successfully.", doc: form });
                }
            })
        }

    },

    getAll: function(req, res) {
        formModel.find({}, function(err, forms) {
            if (err) {
                res.status(500).json({ status: 'error', message: "Database error: " + err, docs: "" });
            } else {
                res.status(200).json({ status: 'success', message: "Forms fetched successfully.", docs: forms });
            }
        })
    },

    getOne: function(req, res) {
       formModel.findOne({_id:req.params.id}).populate('questions.questionId').populate('questionGroups.type').exec(function(err, form) {
            if (err) {
                res.status(500).json({ status: 'error', message: "Database error: " + err, doc: "" });
            } else {
                res.status(200).json({ status: 'success', message: "Forms fetched successfully.", doc: form });
            }
        }) 
       /* formModel.findById(req.params.id, function(err, form) {
            if (err) {
                res.status(500).json({ status: 'error', message: "Database error: " + err, doc: "" });
            } else {
                res.status(200).json({ status: 'success', message: "Forms fetched successfully.", doc: form });
            }
        })*/
    },

    delete: function(req, res) {
        formModel.remove({ _id: req.params.id }, function(err, form) {
            if (err) {
                res.status(500).json({ status: 'error', message: "Database error: " + err, docs: "" });
            } else {
                res.status(200).json({ status: 'success', message: "Form deleted successfully.", docs: '' });
            }
        })
    },

}

module.exports = forms;