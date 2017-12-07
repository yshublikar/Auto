var importLogModel = require('../../models/importLog');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var Excel = require('exceljs');
var async = require('async')
var workbook = new Excel.Workbook();
var _ = require('underscore');

var importLog = {
    getCountry: function(req, res) {
        console.log("req", req.body);
        importLogModel.find({}, function(err, docs) {
            if (err) {
                res.status(500).json({ status: 'error', message: 'Error Adding Record: ' + err, docs: '' });
            } else {

                res.status(200).json({ status: 'success', message: 'Record added successfully', docs: docs });
            }
        });
    },

    create: function(req, res) {
        console.log("req", req.body);
        importLogModel.create(req.body, function(err, docs) {
            if (err) {
                res.status(500).json({ status: 'error', message: 'Error Adding Record: ' + err, docs: '' });
            } else {
                res.status(200).json({ status: 'success', message: 'Record added successfully', docs: docs });
            }
        });
    },
    importNow: function(req, res) {
        console.log("req", req.body);
        req.body.lastImportStartDate = new Date();
        req.body.lastImportCompleteDate = null;
        importLogModel.findByIdAndUpdate(req.body._id, req.body, function(err, docs) {
            if (err) {
                res.status(500).json({ status: 'error', message: 'Error updating Record: ' + err, docs: '' });
            } else {
                res.status(200).json({ status: 'success', message: 'Record updated successfully', docs: docs });
            }
        });
    }
};

module.exports = importLog;