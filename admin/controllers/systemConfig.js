var configModel = require('../../models/config');

var sysConfig = {
    addConfig: function(req, res) {

        configModel.create(req.body, function(err, docs) {
            if (err) {
                res.status(500).json({ status: 'error', message: 'Error Adding Record: ' + err, docs: '' });
            } else {
                res.status(200).json({ status: 'success', message: 'Record added successfully', docs: docs });
            }
        });
    },
    getAll: function(req, res) {
        configModel.find(function(err, configData) {
            if (err) {
                res.status(500).json({ status: 'error', message: 'Database Error:', configData: 'Error' });
            } else {
                res.status(200).json({ status: 'success', message: "successfull .", configData: configData });
            }
        })
    },

    getConfigByKey: function(req, res) {

        configModel.findOne({ key: req.body.key }, function(err, docs) {
            if (err || !docs) {
                res.status(500).json({ status: 'error', message: 'Error getting ' + req.body.key, docs: '' });
            } else {
                res.status(200).json({ status: 'success', message: 'success', docs: docs, value: JSON.parse(docs.value) });
            }
        });
    },

    updateConfig: function(req, res) {

      configModel.findOneAndUpdate({ "_id": req.params.id },
            {$set:{value:JSON.stringify(req.body)}},{new:true},function(err, docs) {
            if (err) {
                res.status(500).json({ status: 'error', message: 'Error Updating Record: ' + err, docs: '' });
            } else {

                res.status(200).json({ status: 'success', message: 'Record updated successfully', docs: docs });
            }
        });
    }

};

module.exports = sysConfig;