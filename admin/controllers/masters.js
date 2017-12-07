var masterModel = require('../../models/master');
var _ = require('underscore');

var master = {
    addMsater: function(req, res) {
        masterModel.create(req.body, function(err, docs) {
            if (err) {
                res.status(500).json({ status: 'error', message: 'Error Adding Record: ' + err, docs: '' });
            } else {
                res.status(200).json({ status: 'success', message: 'Record added successfully', docs: docs });
            }
        });
    },
    updateMsater: function(req, res) {
        masterModel.findOneAndUpdate({ _id: req.params.masterId }, { $set: { masterValue: req.body.masterValue } }, { new: true },
            function(err, docs) {
                if (err) {
                    res.status(500).json({ status: 'error', message: 'Error updated Record: ' + err, docs: '' });
                } else {
                    res.status(200).json({ status: 'success', message: 'Record updated successfully', docs: docs });
                }
            });
    },
    getAll: function(req, res) {
        masterModel.find(function(err, masters) {
            if (err) {
                res.status(500).json({ status: 'error', message: 'Database Error:', docs: '' });
            } else {
                res.status(200).json({ status: 'success', message: "successfull .", docs: masters });
            }
        })
    },
    getMastersByKey: function(req, res) {
        console.log(req.params.key)
        masterModel.find({ masterKey: req.params.key }, function(err, docs) {
            if (err || !docs) {
                res.status(500).json({ status: 'error', message: 'Error getting ' + req.body.key, docs: '' });
            } else {
                res.status(200).json({ status: 'success', message: 'success', docs: docs });
            }
        });
    },
    deleteMasterKey: function(req, res) {
        masterModel.remove({ "_id": req.params.masterId }, function(err, docs) {
            if (err) {
                res.status(500).json({ status: 'error', message: 'Error deleted Record: ' + err, docs: '' });
            } else {
                res.status(200).json({ status: 'success', message: 'Record deleted successfully', docs: docs });
            }
        });
    },
    getMastersByKeys: function(req, res) { //'comma seperated'
        var keys;
        if (req.query.masterKeys) {
            keys = req.query.masterKeys.split(',')
        } else {
            res.status(400).json({ status: 'error', message: 'Please Provide keys as ?masterKeys="<value>,<value>,<value>"', });
            return;
        }
        masterModel.find({ masterKey: { $in: keys } }, function(err, docs) {
            if (err) {
                res.status(500).json({ status: 'error', message: 'Error getting ', docs: '' });
            } else {
                var data = {};
                _.each(keys, function(item) {
                    data[item] = _.filter(docs, { masterKey: item });
                })
                res.status(200).json({ status: 'success', message: 'success', docs: data });
            }
        });
    },

};

module.exports = master;