var makeModel = require('../../models/make.js');
var questionModel = require('../../models/question.js');
var _ = require('underscore');
var fs = require("fs");

var questions = {

    getAll: function(req, res) {
        questionModel.find({status: "Active"}, function(err, questions) {
            if (err) {
                res.status(500).json({ status: 'error', message: "Database error: " + err, docs: "" });
            } else {
                res.status(200).json({ status: 'success', message: "Questions fetched successfully.", docs: questions });
            }
        })
    },

    searchQuestion: function(req, res) {
        console.log("req.query---");
        console.log(req.query);
        questionModel.find({ displayText: new RegExp(req.query.search,"i"),status:"Active"}, function(err, questions) {
            if (err) {
                res.status(500).json({ status: 'error', message: "Database error: " + err, docs: "" });
            } else {
                res.status(200).json({ status: 'success', message: "Questions fetched successfully.", docs: questions });
            }
        })
    },
    create: function(req, res) {
        console.log("req.query---");
        console.log(req.body);
        questionModel.create(req.body, function(err, questions) {
            if (err) {
                res.status(500).json({ status: 'error', message: "Database error: " + err, docs: "" });
            } else {
                res.status(200).json({ status: 'success', message: "Questions added successfully.", docs: questions });
            }
        })
    },
    updateQuestion: function(req, res) {
        console.log("req.query---");
        console.log(req.query);
        questionModel.findByIdAndUpdate(req.params.queId, req.body, { new: true },
            function(err, Question) {
                if (err) {
                    res.status(500).json({ status: "error", message: "Error while updated question", error: err });
                } else {
                    res.status(200).json({ status: "success", message: "Question updated successfully", Question: Question });
                }

            })
    },
    remove: function(req, res) {

       questionModel.findByIdAndUpdate(req.params.queId, { $set: { status: "Archieved" } }, { new: true },
        function(err, doc) {
            if (err) {
                res.status(500).json({ status: "error", message: "Error while updating Question", error: err });
            } else {
                res.status(200).json({ status: "success", message: "Question updated successfully", doc: doc });
            }

        })

       /* questionModel.remove({
                _id: req.params.queId
            },
            function(err, Question) {
                if (err) {
                    res.status(500).json({ status: "error", message: "Error while deleting Question", error: err });
                } else {
                    res.status(200).json({ status: "success", message: "Question deleted successfully", Question: Question });
                }

            })*/
    }

}

module.exports = questions;